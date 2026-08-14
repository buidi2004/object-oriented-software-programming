using System;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using CloudServiceStore.Application.Features.VpsInstances.Commands.TerminateVps;
using CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstanceById;
using CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstances;
using CloudServiceStore.Application.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VpsInstancesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IVpsProvisioningService _provisioningService;

    public VpsInstancesController(IMediator mediator, IVpsProvisioningService provisioningService)
    {
        _mediator = mediator;
        _provisioningService = provisioningService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Provision([FromBody] ProvisionVpsCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Get()
    {
        var result = await _mediator.Send(new GetVpsInstancesQuery());
        return Ok(result);
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllForAdmin()
    {
        var result = await _mediator.Send(new GetVpsInstancesQuery { AdminAll = true });
        return Ok(result);
    }

    [HttpGet("health/docker")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDockerHealth()
    {
        var available = await _provisioningService.IsAvailableAsync(HttpContext.RequestAborted);
        return Ok(new { available });
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetVpsInstanceByIdQuery { Id = id });
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Terminate(Guid id)
    {
        var instance = await _mediator.Send(new GetVpsInstanceByIdQuery { Id = id });
        if (instance == null) return NotFound();

        await _mediator.Send(new TerminateVpsCommand { ContainerId = instance.ContainerId });
        return NoContent();
    }

    [HttpPost("{id}/start")]
    [Authorize]
    public async Task<IActionResult> Start(Guid id)
    {
        await _mediator.Send(new Application.Features.VpsInstances.Commands.ChangeVpsState.ChangeVpsStateCommand { Id = id, Action = "Start" });
        return NoContent();
    }

    [HttpPost("{id}/stop")]
    [Authorize]
    public async Task<IActionResult> Stop(Guid id)
    {
        await _mediator.Send(new Application.Features.VpsInstances.Commands.ChangeVpsState.ChangeVpsStateCommand { Id = id, Action = "Stop" });
        return NoContent();
    }

    [HttpPost("{id}/restart")]
    [Authorize]
    public async Task<IActionResult> Restart(Guid id)
    {
        await _mediator.Send(new Application.Features.VpsInstances.Commands.ChangeVpsState.ChangeVpsStateCommand { Id = id, Action = "Restart" });
        return NoContent();
    }
}
