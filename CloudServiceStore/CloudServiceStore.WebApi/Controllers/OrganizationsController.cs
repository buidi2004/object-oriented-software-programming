using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/organizations")]
public class OrganizationsController : ControllerBase
{
    [HttpGet]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetAll(
        [FromServices] IRepository<AppUser> userRepo,
        CancellationToken ct)
    {
        var users = await userRepo.GetAllAsync(ct);
        var orgUsers = users.Where(u => !string.IsNullOrWhiteSpace(u.CompanyName)).ToList();

        var list = orgUsers.Select(u => new
        {
            id = u.Id.ToString(),
            name = u.CompanyName,
            ownerEmail = u.Email,
            ownerName = u.FullName,
            memberCount = 1,
            activeServices = 1,
            tier = "Enterprise",
            createdAt = u.CreatedAt.ToString("o")
        }).ToList();

        return Ok(list);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Customer")]
    public async Task<IActionResult> CreateOrganization([FromBody] CreateOrgDto dto, CancellationToken ct)
    {
        return Ok(new 
        { 
            id = Guid.NewGuid().ToString(), 
            name = dto.Name,
            ownerEmail = dto.OwnerEmail ?? "admin@enterprise.vn",
            memberCount = 1,
            activeServices = 0,
            tier = dto.Tier ?? "Standard",
            createdAt = DateTime.UtcNow.ToString("o")
        });
    }

    [HttpGet("{id:guid}/members")]
    [Authorize(Roles = "Admin,Staff,Customer")]
    public async Task<IActionResult> GetMembers(Guid id, CancellationToken ct)
    {
        return Ok(new List<object>());
    }

    [HttpPost("{id:guid}/invite")]
    [Authorize(Roles = "Admin,Customer,Owner")]
    public async Task<IActionResult> InviteMember(Guid id, [FromBody] dynamic data, CancellationToken ct)
    {
        return Ok(new { success = true });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        return NoContent();
    }
}

public record CreateOrgDto(string Name, string? OwnerEmail, string? Tier);