using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Wishlists.Commands.RemoveFromWishlist;

public class RemoveFromWishlistCommand : IRequest<bool>
{
    public Guid Id { get; set; }
}
