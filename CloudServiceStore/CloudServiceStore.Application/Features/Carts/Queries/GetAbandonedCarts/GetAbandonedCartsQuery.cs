using System.Collections.Generic;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Features.Carts.Queries.GetMyCart; // For CartDto
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Queries.GetAbandonedCarts;

public class GetAbandonedCartsQuery : IRequest<IReadOnlyList<CartDto>>
{
    public int HoursThreshold { get; set; } = 24;
}
