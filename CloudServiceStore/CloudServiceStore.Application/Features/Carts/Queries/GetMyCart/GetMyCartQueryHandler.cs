using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Dapper;

namespace CloudServiceStore.Application.Features.Carts.Queries.GetMyCart;

public class GetMyCartQueryHandler : IRequestHandler<GetMyCartQuery, CartDto>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Cart> _cartRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IDapperContext _dapper;

    public GetMyCartQueryHandler(IUnitOfWork uow, IRepository<Cart> cartRepo, ICurrentUserService currentUser, IDapperContext dapper)
    {
        _uow = uow;
        _cartRepo = cartRepo;
        _currentUser = currentUser;
        _dapper = dapper;
    }

    public async Task<CartDto> Handle(GetMyCartQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập");

        var cart = await _cartRepo.FirstOrDefaultAsync(c => c.UserId == userId, ct, c => c.Items);

        if (cart == null)
        {
            cart = new Cart(userId);
            await _cartRepo.AddAsync(cart, ct);
            await _uow.SaveChangesAsync(ct);
        }
        else if (cart.Status != Domain.Enums.CartStatus.Active)
        {
            cart.Reactivate();
            cart.Clear();
            _cartRepo.Update(cart);
            await _uow.SaveChangesAsync(ct);
        }

        // Query items using Dapper
        const string sql = @"
            SELECT 
                ci.Id, 
                ci.ServicePlanId, 
                CASE 
                    WHEN c.Slug = 'cloud-vps' THEN 'vps'
                    WHEN c.Slug = 'web-hosting' THEN 'hosting'
                    WHEN c.Slug = 'ten-mien' THEN 'domain'
                    ELSE 'vps'
                END as Type,
                sp.Name as Title,
                COALESCE(CONCAT('CPU: ', sp.Cpu, ' Core - RAM: ', sp.Ram, ' - SSD: ', sp.Ssd), 'Cấu hình tiêu chuẩn') as Details,
                COALESCE(pp.Price, 0) as Price,
                CASE 
                    WHEN ci.BillingCycle = 1 THEN N'1 tháng' 
                    WHEN ci.BillingCycle = 2 THEN N'1 năm' 
                    WHEN ci.BillingCycle = 3 THEN N'2 năm' 
                    ELSE N'Khác' 
                END as BillingCycle,
                ci.Quantity
            FROM CartItems ci
            JOIN ServicePlans sp ON ci.ServicePlanId = sp.Id
            JOIN ServiceCategories c ON sp.CategoryId = c.Id
            LEFT JOIN PlanPrices pp ON pp.ServicePlanId = sp.Id AND pp.BillingCycle = ci.BillingCycle
            WHERE ci.CartId = @CartId";
            
        using var conn = _dapper.CreateConnection();
        var items = await conn.QueryAsync<CartItemDto>(sql, new { CartId = cart.Id });

        return new CartDto(cart.Id, cart.Status, items.ToList());
    }
}
