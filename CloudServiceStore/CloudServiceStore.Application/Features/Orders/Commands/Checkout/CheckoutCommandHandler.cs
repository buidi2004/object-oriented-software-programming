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


namespace CloudServiceStore.Application.Features.Orders.Commands.Checkout;

public class CheckoutCommandHandler : IRequestHandler<CheckoutCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Cart> _cartRepo;
    private readonly IRepository<CartItem> _cartItemRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<Coupon> _couponRepo;
    private readonly IRepository<PlanPrice> _priceRepo;
    private readonly ICurrentUserService _currentUser;

    public CheckoutCommandHandler(IUnitOfWork uow, IRepository<Cart> cartRepo, IRepository<CartItem> cartItemRepo, IRepository<OrderRequest> orderRepo, IRepository<Coupon> couponRepo, IRepository<PlanPrice> priceRepo, ICurrentUserService currentUser)
    { _uow = uow; _cartRepo = cartRepo; _cartItemRepo = cartItemRepo; _orderRepo = orderRepo; _couponRepo = couponRepo; _priceRepo = priceRepo; _currentUser = currentUser; }

    public async Task<Guid> Handle(CheckoutCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var cart = await _cartRepo.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CartStatus.Active, ct);
        if (cart == null) throw new ConflictException("Giỏ hàng rỗng.");

        var items = await _cartItemRepo.WhereAsync(ci => ci.CartId == cart.Id, ct);
        var item = items.FirstOrDefault();
        if (item == null) throw new ConflictException("Giỏ hàng rỗng.");

        // Get Price — filter by Currency="VND" for backward-compatibility after multi-currency schema update
        var prices = await _priceRepo.WhereAsync(p => p.ServicePlanId == item.ServicePlanId && p.BillingCycle == item.BillingCycle && p.Currency == "VND", ct);
        var price = prices.OrderByDescending(p => p.EffectiveFrom).FirstOrDefault()?.Price ?? 100000m; // Default 100k if no price set

        decimal subTotal = price * item.Quantity;
        decimal discountAmount = 0;
        Guid? couponId = null;

        if (!string.IsNullOrEmpty(request.CouponCode))
        {
            var coupon = await _couponRepo.FirstOrDefaultAsync(c => c.Code == request.CouponCode && c.IsActive && c.ExpiryDate > DateTime.UtcNow, ct);
            if (coupon == null || coupon.UsedCount >= coupon.MaxUsage)
                throw new ConflictException("Mã giảm giá không hợp lệ hoặc đã hết lượt.");

            coupon.UsedCount++;
            _couponRepo.Update(coupon);
            discountAmount = subTotal * (coupon.DiscountPercent / 100m);
            couponId = coupon.Id;
        }

        var order = new OrderRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ServicePlanId = item.ServicePlanId,
            BillingCycle = item.BillingCycle,
            Status = OrderStatus.Pending,
            CouponId = couponId,
            DiscountAmount = discountAmount,
            SubTotal = subTotal,
            TotalAmount = subTotal - discountAmount,
            CreatedAt = DateTime.UtcNow
        };

        await _orderRepo.AddAsync(order, ct);

        cart.Status = CartStatus.CheckedOut;
        _cartRepo.Update(cart);

        await _uow.SaveChangesAsync(ct);
        return order.Id;
    }
}
