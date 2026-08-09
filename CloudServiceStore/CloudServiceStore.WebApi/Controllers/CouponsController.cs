using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Coupons.Commands.ApplyCoupon;
using CloudServiceStore.Application.Features.Coupons.Commands.CreateCoupon;
using CloudServiceStore.Application.Features.Coupons.Queries.GetCoupons;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController : ControllerBase
{
    private readonly IMediator _mediator;
    public CouponsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var coupons = await _mediator.Send(new GetCouponsQuery(), ct);
        return Ok(coupons);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateCouponCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpPost("apply")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Apply(ApplyCouponCommand command, CancellationToken ct)
    {
        var success = await _mediator.Send(command, ct);
        return Ok(new { success });
    }
}
