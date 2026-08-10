using MediatR;

namespace CloudServiceStore.Application.Features.GiftCards.Commands.RedeemGiftCard;

public class RedeemGiftCardCommand : IRequest<decimal>
{
    public string Code { get; set; } = null!;
    public decimal AmountToRedeem { get; set; }
}
