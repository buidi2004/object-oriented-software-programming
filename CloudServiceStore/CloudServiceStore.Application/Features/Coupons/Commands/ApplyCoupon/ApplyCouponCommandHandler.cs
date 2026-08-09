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

        if (order.Status != OrderStatus.Pending)
            throw new ConflictException("Đơn hàng đã được xử lý hoặc thanh toán, không thể áp dụng mã giảm giá.");
            
        if (order.CouponId.HasValue)
            throw new ConflictException("Đơn hàng đã được áp dụng mã giảm giá. Không thể áp dụng thêm.");

        var coupons = await _couponRepo.WhereAsync(c => c.Code == request.Code, cancellationToken);
        var coupon = coupons.FirstOrDefault() ?? throw new NotFoundException("Mã giảm giá không hợp lệ.");

        if (!coupon.IsActive)
            throw new ConflictException("Mã giảm giá đã bị vô hiệu hóa.");
            
        if (coupon.ExpiryDate < DateTime.UtcNow)
            throw new ConflictException("Mã giảm giá đã hết hạn.");
            
        if (coupon.UsedCount >= coupon.MaxUsage)
            throw new ConflictException("Mã giảm giá đã hết lượt sử dụng.");

        // Apply discount
        coupon.UsedCount += 1;
        
        var discountAmount = order.SubTotal * (coupon.DiscountPercent / 100);
        
        order.CouponId = coupon.Id;
        order.DiscountAmount = discountAmount;
        order.TotalAmount = order.SubTotal - discountAmount;
        
        _couponRepo.Update(coupon);
        _orderRepo.Update(order);
        
        await _uow.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
