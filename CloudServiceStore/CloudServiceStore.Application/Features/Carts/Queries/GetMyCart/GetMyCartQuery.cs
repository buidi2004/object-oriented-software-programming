using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Queries.GetMyCart;

public record GetMyCartQuery : IRequest<CartDto>;

public record CartDto(Guid Id, CloudServiceStore.Domain.Enums.CartStatus Status, List<CartItemDto> Items);
public record CartItemDto(
    Guid Id, 
    Guid ServicePlanId, 
    string Type, 
    string Title, 
    string Details, 
    decimal Price, 
    string BillingCycle, 
    int Quantity);
