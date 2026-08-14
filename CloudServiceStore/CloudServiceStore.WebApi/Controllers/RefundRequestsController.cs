using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.RefundRequests.Commands.ApproveRefundRequest;
using CloudServiceStore.Application.Features.RefundRequests.Commands.CreateRefundRequest;
using CloudServiceStore.Application.Features.RefundRequests.Commands.RejectRefundRequest;
using CloudServiceStore.Application.Features.RefundRequests.Queries.GetAllRefundRequests;
using CloudServiceStore.Application.Features.RefundRequests.Queries.GetMyRefundRequests;
using CloudServiceStore.Application.Features.RefundRequests.Queries.GetRefundRequestById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api")]
public class RefundRequestsController : ControllerBase
{
    private readonly IMediator _mediator;
    public RefundRequestsController(IMediator mediator) => _mediator = mediator;

    [HttpPost("orders/{orderId}/refund-requests")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create(Guid orderId, [FromBody] CreateRefundRequestDto dto, CancellationToken ct)
    {
        var command = new CreateRefundRequestCommand(orderId, dto.Reason, dto.RefundAmount);
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpGet("refund-requests/me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMy(CancellationToken ct)
    {
        var requests = await _mediator.Send(new GetMyRefundRequestsQuery(), ct);
        return Ok(requests);
    }

    [HttpGet("refund-requests")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var requests = await _mediator.Send(new GetAllRefundRequestsQuery(), ct);
        return Ok(requests);
    }

    [HttpGet("refund-requests/{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRefundRequestByIdQuery(id), ct);
        return Ok(result);
    }

    [HttpPatch("refund-requests/{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        var success = await _mediator.Send(new ApproveRefundRequestCommand(id), ct);
        return Ok(new { success });
    }

    [HttpPatch("refund-requests/{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(Guid id, CancellationToken ct)
    {
        var success = await _mediator.Send(new RejectRefundRequestCommand(id), ct);
        return Ok(new { success });
    }
}

public class CreateRefundRequestDto
{
    public string Reason { get; set; } = null!;
    public decimal RefundAmount { get; set; }
}
