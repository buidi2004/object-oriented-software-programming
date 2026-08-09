using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Coupons.Commands.ApplyCoupon;

public class ApplyCouponCommandHandler : IRequestHandler<ApplyCouponCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Coupon> _couponRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly ICurrentUserService _currentUser;

    public ApplyCouponCommandHandler(IUnitOfWork uow, IRepository<Coupon> couponRepo, IRepository<OrderRequest> orderRepo, ICurrentUserService currentUser)
    { _uow = uow; _couponRepo = couponRepo; _orderRepo = orderRepo; _currentUser = currentUser; }

    public async Task<bool> Handle(ApplyCouponCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var order = await _orderRepo.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");

        if (order.UserId != userId)
            throw new UnauthorizedException("Đơn hàng không thuộc về bạn.");

        var coupons = await _couponRepo.WhereAsync(c => c.Code == request.Code, cancellationToken);
        var coupon = coupons.FirstOrDefault() ?? throw new NotFoundException("Mã giảm giá không hợp lệ.");

        try
        {
            order.ApplyCoupon(coupon);
        }
        catch (InvalidOperationException ex)
        {
            throw new ConflictException(ex.Message);
        }

        _couponRepo.Update(coupon);
        _orderRepo.Update(order);

        await _uow.SaveChangesAsync(cancellationToken);

        return true;
    }
}
