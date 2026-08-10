using MediatR;

namespace CloudServiceStore.Application.Features.Loyalty.Commands.RedeemLoyalty;

public class RedeemLoyaltyCommand : IRequest<bool>
{
    public int PointsToRedeem { get; set; }
}
