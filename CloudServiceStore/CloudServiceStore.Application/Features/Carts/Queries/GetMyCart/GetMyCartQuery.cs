using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Queries.GetMyCart;

public record GetMyCartQuery : IRequest<CartDto>;

public record CartDto(Guid Id, string Status, List<CartItemDto> Items);
public record CartItemDto(Guid Id, Guid ServicePlanId, string BillingCycle, int Quantity);
