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

        var cart = await _cartRepo.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CloudServiceStore.Domain.Enums.CartStatus.Active, ct);
        
        if (cart == null)
        {
            cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Status = CloudServiceStore.Domain.Enums.CartStatus.Active
            };
            await _cartRepo.AddAsync(cart, ct);
            await _uow.SaveChangesAsync(ct);
        }

        // Query items using Dapper
        const string sql = "SELECT Id, ServicePlanId, BillingCycle, Quantity FROM CartItems WHERE CartId = @CartId";
        using var conn = _dapper.CreateConnection();
        var items = await conn.QueryAsync<CartItemDto>(sql, new { CartId = cart.Id });

        return new CartDto(cart.Id, cart.Status, items.ToList());
    }
}
