using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.GiftCards.Commands.RedeemGiftCard;

public class RedeemGiftCardCommandHandler : IRequestHandler<RedeemGiftCardCommand, decimal>
{
    private readonly IRepository<GiftCard> _repo;
    private readonly IUnitOfWork _uow;

    public RedeemGiftCardCommandHandler(IRepository<GiftCard> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    public async Task<decimal> Handle(RedeemGiftCardCommand request, CancellationToken cancellationToken)
    {
        if (request.AmountToRedeem <= 0) throw new BadRequestException("Amount to redeem must be greater than zero.");

        var card = await _repo.FirstOrDefaultAsync(x => x.Code == request.Code, cancellationToken);
        if (card == null) throw new NotFoundException(nameof(GiftCard), request.Code);
        if (!card.IsActive) throw new BadRequestException("Gift card is inactive.");
        if (card.ExpiryDate < DateTime.UtcNow) throw new BadRequestException("Gift card is expired.");
        if (card.RemainingAmount < request.AmountToRedeem) throw new BadRequestException("Insufficient gift card balance.");

        card.RemainingAmount -= request.AmountToRedeem;
        if (card.RemainingAmount == 0) card.IsActive = false;

        _repo.Update(card);
        await _uow.SaveChangesAsync(cancellationToken);

        return card.RemainingAmount;
    }
}
