using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Wishlists.Commands.AddToWishlist;

public class AddToWishlistCommand : IRequest<Guid>
{
    public Guid ServicePlanId { get; set; }
}
