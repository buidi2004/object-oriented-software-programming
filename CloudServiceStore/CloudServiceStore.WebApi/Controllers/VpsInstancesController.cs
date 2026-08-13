using System;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using CloudServiceStore.Application.Features.VpsInstances.Commands.TerminateVps;
using CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstanceById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VpsInstancesController : ControllerBase
{
    private readonly IMediator _mediator;

    public VpsInstancesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Provision([FromBody] ProvisionVpsCommand command)
    {
        var containerId = await _mediator.Send(command);
        return Ok(new { ContainerId = containerId });
    }
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> Get()
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstances.GetVpsInstancesQuery());
        return Ok(result);
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
        // First get the container ID
        var instance = await _mediator.Send(new GetVpsInstanceByIdQuery { Id = id });
        if (instance == null) return NotFound();

        await _mediator.Send(new TerminateVpsCommand { ContainerId = instance.ContainerId });
        return NoContent();
    }
}
