using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Carts.Commands.UpdateCartItem;

public record UpdateCartItemCommand(Guid ItemId, int Quantity) : IRequest;
