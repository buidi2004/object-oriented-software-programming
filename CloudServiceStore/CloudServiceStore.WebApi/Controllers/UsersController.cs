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
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(
        [FromBody] AdminCreateUserRequest body,
        [FromServices] CloudServiceStore.Application.Interfaces.IPasswordHasher passwordHasher,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRoleRepository roleRepo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.AppUser> userRepo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(body.Email) || string.IsNullOrWhiteSpace(body.FullName) || string.IsNullOrWhiteSpace(body.Password))
            return BadRequest(new { message = "Vui lòng nhập đầy đủ họ tên, email và mật khẩu." });

        if (await userRepo.AnyAsync(u => u.Email == body.Email, ct))
            return Conflict(new { message = "Email này đã được sử dụng." });

        var roleName = string.IsNullOrWhiteSpace(body.Role) ? "Customer" : body.Role;
        var roleId = await roleRepo.GetIdByNameAsync(roleName, ct);
        if (roleId == Guid.Empty)
            return BadRequest(new { message = $"Vai trò {roleName} không hợp lệ." });

        var passwordHash = passwordHasher.Hash(body.Password);
        var user = new CloudServiceStore.Domain.Entities.AppUser(
            fullName: body.FullName,
            email: body.Email,
            passwordHash: passwordHash,
            roleId: roleId,
            phoneNumber: body.PhoneNumber
        );

        if (body.IsActive == false)
            user.Deactivate();

        await userRepo.AddAsync(user, ct);
        await uow.SaveChangesAsync(ct);

        return Ok(new { id = user.Id, message = "Tạo người dùng mới thành công!" });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] AdminUpdateUserRequest body,
        [FromServices] CloudServiceStore.Application.Interfaces.IPasswordHasher passwordHasher,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRoleRepository roleRepo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.AppUser> userRepo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow,
        CancellationToken ct)
    {
        var user = await userRepo.GetByIdAsync(id, ct);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var targetFullName = !string.IsNullOrWhiteSpace(body.FullName) ? body.FullName : user.FullName;
        var targetPhoneNumber = body.PhoneNumber ?? user.PhoneNumber;
        var targetEmail = user.Email;

        if (!string.IsNullOrWhiteSpace(body.Email) && body.Email != user.Email)
        {
            if (await userRepo.AnyAsync(u => u.Email == body.Email && u.Id != id, ct))
                return Conflict(new { message = "Email này đã được sử dụng bởi tài khoản khác." });
            targetEmail = body.Email;
        }

        user.UpdateBasicInfo(targetFullName, targetEmail, targetPhoneNumber);

        if (!string.IsNullOrWhiteSpace(body.Role))
        {
            var roleId = await roleRepo.GetIdByNameAsync(body.Role, ct);
            if (roleId != Guid.Empty)
                user.ChangeRole(roleId);
        }

        if (body.IsActive.HasValue)
        {
            if (body.IsActive.Value) user.Activate();
            else user.Deactivate();
        }

        if (!string.IsNullOrWhiteSpace(body.NewPassword))
        {
            user.ChangePassword(passwordHasher.Hash(body.NewPassword));
        }

        userRepo.Update(user);
        await uow.SaveChangesAsync(ct);

        return Ok(new { message = "Cập nhật thông tin người dùng thành công!" });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.AppUser> userRepo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.OrderRequest> orderRepo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow,
        CancellationToken ct)
    {
        var user = await userRepo.GetByIdAsync(id, ct);
        if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

        var hasOrders = await orderRepo.AnyAsync(o => o.UserId == id, ct);
        if (hasOrders)
        {
            user.Deactivate();
            userRepo.Update(user);
            await uow.SaveChangesAsync(ct);
            return Ok(new { message = "Tài khoản có lịch sử đơn hàng nên đã được chuyển sang trạng thái Vô hiệu hóa (Khóa) để bảo toàn dữ liệu tài chính." });
        }
        else
        {
            userRepo.Delete(user);
            await uow.SaveChangesAsync(ct);
            return Ok(new { message = "Đã xóa tài khoản khỏi hệ thống thành công!" });
        }
    }
}

public record ChangeRoleRequest(string RoleName);
public record AdminCreateUserRequest(string FullName, string Email, string Password, string? Role = "Customer", string? PhoneNumber = null, bool? IsActive = true);
public record AdminUpdateUserRequest(string? FullName, string? Email, string? PhoneNumber = null, string? Role = null, bool? IsActive = null, string? NewPassword = null);
