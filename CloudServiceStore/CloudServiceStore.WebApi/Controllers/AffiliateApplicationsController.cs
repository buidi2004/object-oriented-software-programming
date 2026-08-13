using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Affiliates.Commands.Approve;
using CloudServiceStore.Application.Features.Affiliates.Commands.CreateApplication;
using CloudServiceStore.Application.Features.Affiliates.Commands.Reject;
using CloudServiceStore.Application.Features.Affiliates.Queries.GetAllApplications;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/affiliate-applications")]
public class AffiliateApplicationsController : ControllerBase
{
    private readonly IMediator _mediator;
    public AffiliateApplicationsController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CreateAffiliateApplicationCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(null, new { id });
    }

    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyApplication(CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.Affiliates.Queries.GetMyApplication.GetMyAffiliateApplicationQuery(), ct);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllAffiliateApplicationsQuery(), ct);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new ApproveAffiliateCommand(id), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new RejectAffiliateCommand(id), ct);
        return NoContent();
    }
}
