using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Coupons.Queries.GetActiveCoupons;

public class ActiveCouponDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public decimal DiscountPercent { get; set; }
    public DateTime ExpiryDate { get; set; }
}

public record GetActiveCouponsQuery() : IRequest<List<ActiveCouponDto>>;

public class GetActiveCouponsQueryHandler : IRequestHandler<GetActiveCouponsQuery, List<ActiveCouponDto>>
{
    private readonly IRepository<Coupon> _couponRepository;

    public GetActiveCouponsQueryHandler(IRepository<Coupon> couponRepository)
    {
        _couponRepository = couponRepository;
    }

    public async Task<List<ActiveCouponDto>> Handle(GetActiveCouponsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var coupons = await _couponRepository.WhereAsync(c => c.IsActive && c.ExpiryDate > now && c.UsedCount < c.MaxUsage, cancellationToken);

        return coupons.Select(c => new ActiveCouponDto
        {
            Id = c.Id,
            Code = c.Code,
            DiscountPercent = c.DiscountPercent,
            ExpiryDate = c.ExpiryDate
        }).OrderBy(x => x.ExpiryDate).ToList();
    }
}
