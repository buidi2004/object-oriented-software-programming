using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Users.Commands.ChangeRole;
using CloudServiceStore.Application.Features.Users.Commands.LockUser;
using CloudServiceStore.Application.Features.Users.Commands.UpdateProfile;
using CloudServiceStore.Application.Features.Users.Commands.UploadAvatar;
using CloudServiceStore.Application.Features.Users.Queries.GetProfile;
using CloudServiceStore.Application.Features.Users.Queries.GetUsers;
using CloudServiceStore.Application.Features.Users.Queries.GetUserById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;
    public UsersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUsersQuery(), ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetUserByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/lock")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Lock(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new LockUserCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ChangeRole(Guid id, [FromBody] ChangeRoleRequest body, CancellationToken ct)
    {
        await _mediator.Send(new ChangeUserRoleCommand(id, body.RoleName), ct);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetProfileQuery(), ct);
        return Ok(result);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpPost("me/avatar")]
    [Authorize]
    public async Task<IActionResult> UploadAvatar(IFormFile file, [FromServices] IWebHostEnvironment env, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không có file được chọn." });

        if (file.Length > 2 * 1024 * 1024)
            return BadRequest(new { message = "Kích thước ảnh không được vượt quá 2MB." });

        var uploadsFolder = Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "avatars");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var avatarUrl = $"/images/avatars/{fileName}";
        await _mediator.Send(new UploadAvatarCommand(avatarUrl), ct);

        return Ok(new { avatarUrl });
    }
}

public record ChangeRoleRequest(string RoleName);
