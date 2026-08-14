using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Auth.Commands.Login;
using CloudServiceStore.Application.Features.Auth.Commands.Register;
using CloudServiceStore.Application.Features.Auth.Commands.RefreshToken;
using CloudServiceStore.Application.Features.Auth.Commands.ForgotPassword;
using CloudServiceStore.Application.Features.Auth.Commands.ResetPassword;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        return Ok(new { success = result.Success });
    }

    [HttpPost("reset-password")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return Ok(new { success = true });
    }
}

public record ForgotPasswordRequest(string Email);
public record RefreshTokenRequest(string RefreshToken);
