using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Queries.GetMyCart;

public record GetMyCartQuery : IRequest<CartDto>;

public record CartDto(Guid Id, CloudServiceStore.Domain.Enums.CartStatus Status, List<CartItemDto> Items);
public record CartItemDto(Guid Id, Guid ServicePlanId, CloudServiceStore.Domain.Enums.BillingCycle BillingCycle, int Quantity);
