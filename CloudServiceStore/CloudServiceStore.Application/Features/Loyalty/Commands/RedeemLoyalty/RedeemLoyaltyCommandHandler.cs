using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Loyalty.Commands.RedeemLoyalty;

public class RedeemLoyaltyCommandHandler : IRequestHandler<RedeemLoyaltyCommand, bool>
{
    private readonly IRepository<LoyaltyPoint> _pointRepo;
    private readonly IRepository<LoyaltyTransaction> _transactionRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public RedeemLoyaltyCommandHandler(
        IRepository<LoyaltyPoint> pointRepo,
        IRepository<LoyaltyTransaction> transactionRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUser)
    {
        _pointRepo = pointRepo;
        _transactionRepo = transactionRepo;
        _uow = uow;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(RedeemLoyaltyCommand request, CancellationToken cancellationToken)
    {
        if (request.PointsToRedeem <= 0) throw new BadRequestException("Points to redeem must be greater than zero.");

        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        var point = await _pointRepo.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (point == null || point.Points < request.PointsToRedeem)
        {
            throw new BadRequestException("Not enough loyalty points.");
        }

        point.Points -= request.PointsToRedeem;
        _pointRepo.Update(point);

        var transaction = new LoyaltyTransaction
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Points = -request.PointsToRedeem,
            Reason = "Redeemed for discount",
            CreatedAt = DateTime.UtcNow
        };
        await _transactionRepo.AddAsync(transaction, cancellationToken);

        await _uow.SaveChangesAsync(cancellationToken);
        return true;
    }
}
