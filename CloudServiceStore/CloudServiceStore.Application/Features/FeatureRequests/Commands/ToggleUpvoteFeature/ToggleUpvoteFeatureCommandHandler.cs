using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.FeatureRequests.Commands.ToggleUpvoteFeature;

public class ToggleUpvoteFeatureCommandHandler : IRequestHandler<ToggleUpvoteFeatureCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<FeatureRequest> _featureRepo;
    private readonly IRepository<FeatureUpvote> _upvoteRepo;
    private readonly ICurrentUserService _currentUser;

    public ToggleUpvoteFeatureCommandHandler(
        IUnitOfWork uow,
        IRepository<FeatureRequest> featureRepo,
        IRepository<FeatureUpvote> upvoteRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _featureRepo = featureRepo;
        _upvoteRepo = upvoteRepo;
        _currentUser = currentUser;
    }

    public async Task<bool> Handle(ToggleUpvoteFeatureCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");
        var feature = await _featureRepo.GetByIdAsync(request.FeatureRequestId, ct)
            ?? throw new NotFoundException("Feature request not found.");

        var existing = await _upvoteRepo.FirstOrDefaultAsync(
            x => x.FeatureRequestId == request.FeatureRequestId && x.UserId == userId,
            ct);

        if (existing == null)
        {
            await _upvoteRepo.AddAsync(new FeatureUpvote
            {
                Id = Guid.NewGuid(),
                FeatureRequestId = request.FeatureRequestId,
                UserId = userId
            }, ct);

            feature.UpvoteCount += 1;
            _featureRepo.Update(feature);
            await _uow.SaveChangesAsync(ct);
            return true;
        }

        _upvoteRepo.Delete(existing);
        feature.UpvoteCount = Math.Max(0, feature.UpvoteCount - 1);
        _featureRepo.Update(feature);
        await _uow.SaveChangesAsync(ct);
        return false;
    }
}
