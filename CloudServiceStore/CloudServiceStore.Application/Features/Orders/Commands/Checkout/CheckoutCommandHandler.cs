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
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<Coupon> _couponRepo;
    private readonly IRepository<PlanPrice> _priceRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IRepository<Cart> _cartRepo;
    private readonly IEmailService _emailService;
    private readonly IRepository<AppUser> _userRepo;

    public CheckoutCommandHandler(IUnitOfWork uow, IRepository<OrderRequest> orderRepo, IRepository<Coupon> couponRepo, IRepository<PlanPrice> priceRepo, ICurrentUserService currentUser, IRepository<Cart> cartRepo, IEmailService emailService, IRepository<AppUser> userRepo)
    { _uow = uow; _orderRepo = orderRepo; _couponRepo = couponRepo; _priceRepo = priceRepo; _currentUser = currentUser; _cartRepo = cartRepo; _emailService = emailService; _userRepo = userRepo; }

    public async Task<Guid> Handle(CheckoutCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var cart = await _cartRepo.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CartStatus.Active, ct, c => c.Items);

        if (cart == null || !cart.Items.Any()) throw new ConflictException("Giỏ hàng rỗng.");
        
        var orderItems = new System.Collections.Generic.List<OrderItem>();
        decimal subTotal = 0;

        foreach (var item in cart.Items)
        {
            var prices = await _priceRepo.WhereAsync(p => p.ServicePlanId == item.ServicePlanId && p.BillingCycle == item.BillingCycle && p.Currency == "VND", ct);
            var price = prices.OrderByDescending(p => p.EffectiveFrom).FirstOrDefault()?.Price ?? 100000m; // Default 100k if no price set

            decimal itemTotal = price * item.Quantity;
            subTotal += itemTotal;
            orderItems.Add(new OrderItem(item.ServicePlanId, item.BillingCycle, item.Quantity, price));
        }

        decimal discountAmount = 0;
        Guid? couponId = null;

        if (cart.BundleDiscountPercent > 0)
            discountAmount = subTotal * (cart.BundleDiscountPercent / 100m);

        if (!string.IsNullOrEmpty(request.CouponCode))
        {
            var coupon = await _couponRepo.FirstOrDefaultAsync(c => c.Code == request.CouponCode && c.IsActive && c.ExpiryDate > DateTime.UtcNow, ct);
            if (coupon == null || coupon.UsedCount >= coupon.MaxUsage)
                throw new ConflictException("Mã giảm giá không hợp lệ hoặc đã hết lượt.");

            coupon.Use();
            _couponRepo.Update(coupon);
            discountAmount = Math.Max(discountAmount, subTotal * (coupon.DiscountPercent / 100m));
            couponId = coupon.Id;
        }

        var order = new OrderRequest(userId, orderItems, couponId, discountAmount, subTotal, false);

        await _orderRepo.AddAsync(order, ct);

        cart.Checkout();

        await _uow.SaveChangesAsync(ct);

        // Send order confirmation email to customer
        try
        {
            var user = await _userRepo.GetByIdAsync(userId, ct);
            if (user != null && !string.IsNullOrEmpty(user.Email))
            {
                await _emailService.SendOrderConfirmationEmailAsync(
                    user.Email,
                    order.Id.ToString(),
                    order.TotalAmount,
                    ct);
            }
        }
        catch
        {
            // Don't let email failure crash the checkout flow
        }

        return order.Id;
    }
}
