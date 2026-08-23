using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Login;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using CloudServiceStore.Application.Features.Auth.Commands.RefreshToken;
using CloudServiceStore.Application.Features.Auth.Commands.ForgotPassword;
using CloudServiceStore.Application.Features.Auth.Commands.ResetPassword;
using CloudServiceStore.Application.Features.Auth.Commands.GoogleLogin;
using CloudServiceStore.Application.Features.Auth.Commands.TwoFactor;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.RateLimiting;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;
    public AuthController(IMediator mediator) => _mediator = mediator;

    private void SetRefreshTokenCookie(string token) =>
        Response.Cookies.Append("refreshToken", token, new CookieOptions
        {
            HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Register), new { id = result.UserId }, result);
    }

    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        
        if (result.RequiresTwoFactor)
        {
            return Ok(new { requiresTwoFactor = true, email = result.Email });
        }

        SetRefreshTokenCookie(result.RefreshToken);
        return Ok(new { accessToken = result.AccessToken, refreshToken = result.RefreshToken });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest? body, CancellationToken ct)
    {
        var refreshToken = !string.IsNullOrWhiteSpace(body?.RefreshToken)
            ? body.RefreshToken
            : Request.Cookies.TryGetValue("refreshToken", out var cookieToken)
                ? cookieToken
                : null;

        if (string.IsNullOrWhiteSpace(refreshToken))
            return Unauthorized();

        var result = await _mediator.Send(new RefreshTokenCommand(refreshToken), ct);
        SetRefreshTokenCookie(result.RefreshToken);
        return Ok(new { accessToken = result.AccessToken, refreshToken = result.RefreshToken });
    }

    [HttpPost("forgot-password")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest body, CancellationToken ct)
    {
        var result = await _mediator.Send(new ForgotPasswordCommand(body.Email), ct);
        if (!result.Success)
        {
            return BadRequest(new
            {
                success = false,
                userFound = result.UserFound,
                message = result.Message ?? "Địa chỉ email này chưa được đăng ký trong hệ thống SEN CloudHost."
            });
        }
        return Ok(new
        {
            success = true,
            userFound = true,
            message = result.Message ?? "Đã tìm thấy tài khoản! Hệ thống đã gửi mật khẩu mới về email của bạn."
        });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { success = true });
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginCommand command, CancellationToken ct)
    {
        try
        {
            var result = await _mediator.Send(command, ct);
            if (result.RequiresTwoFactor)
            {
                return Ok(new { requiresTwoFactor = true, email = result.Email });
            }
            SetRefreshTokenCookie(result.RefreshToken);
            return Ok(new { accessToken = result.AccessToken, refreshToken = result.RefreshToken });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("2fa/setup")]
    public async Task<IActionResult> SetupTwoFactor(CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var result = await _mediator.Send(new SetupTwoFactorCommand(userId), ct);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("2fa/enable")]
    public async Task<IActionResult> EnableTwoFactor([FromBody] EnableTwoFactorRequest request, CancellationToken ct)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdString, out var userId)) return Unauthorized();

        var result = await _mediator.Send(new EnableTwoFactorCommand(userId, request.SecretKey, request.Code), ct);
        return Ok(new { message = "Kích hoạt 2FA thành công.", backupCodes = result.BackupCodes });
    }

    [HttpPost("2fa/verify-login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> VerifyTwoFactorLogin([FromBody] VerifyTwoFactorRequest request, CancellationToken ct)
    {
        try
        {
            var deviceInfo = Request.Headers.UserAgent.ToString();
            var result = await _mediator.Send(new VerifyTwoFactorLoginCommand(request.Email, request.Code, deviceInfo), ct);
            SetRefreshTokenCookie(result.RefreshToken);
            return Ok(new { accessToken = result.AccessToken, refreshToken = result.RefreshToken });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("2fa/login-with-recovery-code")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> LoginWithRecoveryCode([FromBody] LoginWithRecoveryCodeRequest request, CancellationToken ct)
    {
        try
        {
            var deviceInfo = Request.Headers.UserAgent.ToString();
            var result = await _mediator.Send(new LoginWithRecoveryCodeCommand(request.Email, request.RecoveryCode, deviceInfo), ct);
            SetRefreshTokenCookie(result.RefreshToken);
            return Ok(new { accessToken = result.AccessToken, refreshToken = result.RefreshToken });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public record ForgotPasswordRequest(string Email);
public record RefreshTokenRequest(string RefreshToken);
public record EnableTwoFactorRequest(string SecretKey, string Code);
public record VerifyTwoFactorRequest(string Email, string Code);
public record LoginWithRecoveryCodeRequest(string Email, string RecoveryCode);
