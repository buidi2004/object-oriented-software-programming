using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Commands.RemoveFromCart;

public record RemoveFromCartCommand(Guid ItemId) : IRequest;
