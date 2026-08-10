using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Referrals.Commands.ApplyReferralCode;

public class ApplyReferralCodeCommandHandler : IRequestHandler<ApplyReferralCodeCommand, bool>
{
    private readonly IRepository<ReferralCode> _codeRepo;
    private readonly IRepository<ReferralReward> _rewardRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public ApplyReferralCodeCommandHandler(
        IRepository<ReferralCode> codeRepo,
        IRepository<ReferralReward> rewardRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUser)
    {
        _codeRepo = codeRepo;
        _rewardRepo = rewardRepo;
        _uow = uow;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(ApplyReferralCodeCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        var code = await _codeRepo.FirstOrDefaultAsync(x => x.Code == request.Code, cancellationToken);
        if (code == null) throw new NotFoundException(nameof(ReferralCode), request.Code);

        if (code.UserId == userId) throw new ConflictException("You cannot apply your own referral code.");

        var existingReward = await _rewardRepo.FirstOrDefaultAsync(x => x.ReferredUserId == userId, cancellationToken);
        if (existingReward != null) throw new ConflictException("You have already applied a referral code.");

        var reward = new ReferralReward
        {
            Id = Guid.NewGuid(),
            ReferrerUserId = code.UserId,
            ReferredUserId = userId,
            RewardAmount = 50000m, // 50k VND for both
            Status = "Pending"
        };

        await _rewardRepo.AddAsync(reward, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return true;
    }
}
