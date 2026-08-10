using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.GiftCards.Queries.GetGiftCardBalance;

public class GetGiftCardBalanceQueryHandler : IRequestHandler<GetGiftCardBalanceQuery, GiftCardBalanceDto>
{
    private readonly IRepository<GiftCard> _repo;

    public GetGiftCardBalanceQueryHandler(IRepository<GiftCard> repo)
    {
        _repo = repo;
    }

    public async Task<GiftCardBalanceDto> Handle(GetGiftCardBalanceQuery request, CancellationToken cancellationToken)
    {
        var card = await _repo.FirstOrDefaultAsync(x => x.Code == request.Code, cancellationToken);
        if (card == null) throw new NotFoundException(nameof(GiftCard), request.Code);

        return new GiftCardBalanceDto
        {
            Code = card.Code,
            RemainingAmount = card.RemainingAmount,
            IsActive = card.IsActive
        };
    }
}
