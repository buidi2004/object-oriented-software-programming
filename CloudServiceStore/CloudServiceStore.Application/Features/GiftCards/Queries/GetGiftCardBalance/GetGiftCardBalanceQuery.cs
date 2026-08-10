using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.GiftCards.Queries.GetGiftCardBalance;

public class GetGiftCardBalanceQuery : IRequest<GiftCardBalanceDto>
{
    public string Code { get; set; } = null!;
}
