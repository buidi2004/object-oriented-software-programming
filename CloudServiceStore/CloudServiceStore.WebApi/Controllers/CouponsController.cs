using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Coupons.Commands.ApplyCoupon;
using CloudServiceStore.Application.Features.Coupons.Commands.CreateCoupon;
using CloudServiceStore.Application.Features.Coupons.Queries.GetCoupons;
using CloudServiceStore.Application.Features.Coupons.Queries.GetActiveCoupons;
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

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive(CancellationToken ct)
    {
        var coupons = await _mediator.Send(new GetActiveCouponsQuery(), ct);
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

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        Guid id,
        [FromBody] UpdateCouponDto dto,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.Coupon> repo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow,
        CancellationToken ct)
    {
        var coupon = await repo.GetByIdAsync(id, ct);
        if (coupon == null) return NotFound();

        coupon.UpdateDetails(dto.DiscountPercent, dto.MaxUsage, dto.ExpiryDate, dto.IsActive);

        repo.Update(coupon);
        await uow.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(
        Guid id,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.Coupon> repo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow,
        CancellationToken ct)
    {
        var coupon = await repo.GetByIdAsync(id, ct);
        if (coupon == null) return NotFound();

        coupon.Deactivate();
        repo.Update(coupon);
        await uow.SaveChangesAsync(ct);
        return NoContent();
    }
}

public record UpdateCouponDto(decimal? DiscountPercent, int? MaxUsage, DateTime? ExpiryDate, bool? IsActive);

