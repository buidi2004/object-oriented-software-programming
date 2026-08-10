using MediatR;
using System;

namespace CloudServiceStore.Application.Features.RecentlyViewed.Commands.AddRecentlyViewed;

public class AddRecentlyViewedCommand : IRequest<bool>
{
    public Guid ServicePlanId { get; set; }

    public AddRecentlyViewedCommand(Guid servicePlanId)
    {
        ServicePlanId = servicePlanId;
    }
}
