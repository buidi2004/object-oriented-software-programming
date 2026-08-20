using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Commands.AddToCart;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Cart> _cartRepo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly ICurrentUserService _currentUser;

    public AddToCartCommandHandler(
        IUnitOfWork uow,
        IRepository<Cart> cartRepo,
        IRepository<ServicePlan> planRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _cartRepo = cartRepo;
        _planRepo = planRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddToCartCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập");

        var planExists = await _planRepo.AnyAsync(p => p.Id == request.ServicePlanId && p.IsActive, ct);
        if (!planExists)
            throw new NotFoundException("Gói dịch vụ không tồn tại hoặc đã bị khoá.");

        var cart = await _cartRepo.FirstOrDefaultAsync(c => c.UserId == userId, ct, c => c.Items);

        if (cart == null)
        {
            cart = new Cart(userId);
            await _cartRepo.AddAsync(cart, ct);
        }
        else if (cart.Status != CloudServiceStore.Domain.Enums.CartStatus.Active)
        {
            cart.Reactivate();
            cart.Clear();
            _cartRepo.Update(cart);
        }

        Console.WriteLine($"cart is null? {cart == null}");
        Console.WriteLine($"cart.Items is null? {cart?.Items == null}");
        
        try
        {
            cart?.AddItem(request.ServicePlanId, request.BillingCycle, request.Quantity);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"AddItem threw: {ex}");
            throw;
        }

        try
        {
            await _uow.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"SaveChanges threw: {ex}");
            throw;
        }
        
        try
        {
            var addedItem = cart.Items.FirstOrDefault(i => i.ServicePlanId == request.ServicePlanId && i.BillingCycle == request.BillingCycle);
            return addedItem?.Id ?? Guid.Empty;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"FirstOrDefault threw: {ex}");
            throw;
        }
    }
}
