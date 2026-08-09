using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Features.Carts.Queries.GetMyCart; // For CartDto
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Queries.GetAbandonedCarts;

public class GetAbandonedCartsQueryHandler : IRequestHandler<GetAbandonedCartsQuery, IReadOnlyList<CartDto>>
{
    private readonly IRepository<Cart> _repo;

    public GetAbandonedCartsQueryHandler(IRepository<Cart> repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<CartDto>> Handle(GetAbandonedCartsQuery request, CancellationToken cancellationToken)
    {
        var thresholdDate = DateTime.UtcNow.AddHours(-request.HoursThreshold);

        var carts = await _repo.WhereAsync(c => c.Status == CloudServiceStore.Domain.Enums.CartStatus.Active && c.UpdatedAt < thresholdDate, cancellationToken);
        
        return carts.Select(c => new CartDto(
            c.Id,
            c.Status,
            new List<CartItemDto>() // Simplification for background job return type
        )).ToList();
    }
}
