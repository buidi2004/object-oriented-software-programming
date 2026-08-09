using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Coupons.Queries.GetCoupons;

public class GetCouponsQueryHandler : IRequestHandler<GetCouponsQuery, IEnumerable<Coupon>>
{
    private readonly IRepository<Coupon> _couponRepo;

    public GetCouponsQueryHandler(IRepository<Coupon> couponRepo)
    { _couponRepo = couponRepo; }

    public async Task<IEnumerable<Coupon>> Handle(GetCouponsQuery request, CancellationToken cancellationToken)
    {
        return await _couponRepo.GetAllAsync(cancellationToken);
    }
}
