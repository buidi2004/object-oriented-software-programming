using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Coupons.Commands.CreateCoupon;

public class CreateCouponCommandHandler : IRequestHandler<CreateCouponCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Coupon> _couponRepo;

    public CreateCouponCommandHandler(IUnitOfWork uow, IRepository<Coupon> couponRepo)
    { _uow = uow; _couponRepo = couponRepo; }

    public async Task<Guid> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = new Coupon(request.Code.ToUpperInvariant(), request.DiscountPercent, request.MaxUsage, request.ExpiryDate);
        if (!request.IsActive)
        {
            coupon.Deactivate();
        }

        await _couponRepo.AddAsync(coupon, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return coupon.Id;
    }
}
