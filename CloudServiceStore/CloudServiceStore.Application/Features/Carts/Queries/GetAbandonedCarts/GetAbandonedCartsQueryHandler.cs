using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

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

        var carts = await _repo.WhereAsync(c => c.Status == "Active" && c.UpdatedAt < thresholdDate, cancellationToken);
        
        return carts.Select(c => new CartDto
        {
            Id = c.Id,
            UserId = c.UserId,
            Status = c.Status,
            Items = new List<CartItemDto>() // Simplification for background job return type
        }).ToList();
    }
}
