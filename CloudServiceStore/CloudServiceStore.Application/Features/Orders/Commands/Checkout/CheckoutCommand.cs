using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Orders.Commands.Checkout;

public record CheckoutCommand(string? CouponCode) : IRequest<Guid>;
