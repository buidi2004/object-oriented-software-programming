using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.DatabaseInstances.Commands.CreateDatabaseInstance;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/databases")]
public class DatabasesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<ManagedDatabaseInstance> _repo;
    private readonly ICurrentUserService _currentUser;

    public DatabasesController(
        IMediator mediator,
        IRepository<ManagedDatabaseInstance> repo,
        ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _repo = repo;
        _currentUser = currentUser;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetMyDatabases(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var host = HttpContext.Request.Host.Host;
        if (string.IsNullOrWhiteSpace(host) || host == "0.0.0.0")
        {
            host = "127.0.0.1";
        }

        var databases = userId.HasValue
            ? await _repo.WhereAsync(d => d.UserId == userId.Value, ct)
            : await _repo.GetAllAsync(ct);

        var result = databases.Select(d => new
        {
            id = d.Id,
            name = d.Name,
            engine = d.Engine.ToString(),
            version = d.Version,
            host = host,
            port = d.Port,
            adminUser = d.AdminUser,
            username = d.AdminUser,
            adminPassword = d.AdminPassword,
            status = d.Status.ToString(),
            failureReason = d.FailureReason,
            createdAt = d.CreatedAt
        }).OrderByDescending(d => d.createdAt);

        return Ok(result);
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateDatabase([FromBody] CreateDatabaseInstanceCommand command, CancellationToken ct)
    {
        var instanceId = await _mediator.Send(command, ct);
        return Ok(new { instanceId });
    }
}
