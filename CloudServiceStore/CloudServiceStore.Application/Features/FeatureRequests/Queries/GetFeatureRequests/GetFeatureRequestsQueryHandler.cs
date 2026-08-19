using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.FeatureRequests.Queries.GetFeatureRequests;

public class GetFeatureRequestsQueryHandler : IRequestHandler<GetFeatureRequestsQuery, IReadOnlyList<FeatureRequestDto>>
{
    private readonly IRepository<FeatureRequest> _featureRepo;
    private readonly IRepository<FeatureUpvote> _upvoteRepo;
    private readonly ICurrentUserService _currentUser;

    public GetFeatureRequestsQueryHandler(
        IRepository<FeatureRequest> featureRepo,
        IRepository<FeatureUpvote> upvoteRepo,
        ICurrentUserService currentUser)
    {
        _featureRepo = featureRepo;
        _upvoteRepo = upvoteRepo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<FeatureRequestDto>> Handle(GetFeatureRequestsQuery request, CancellationToken ct)
    {
        var all = await _featureRepo.GetAllAsync(ct);

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            all = all.Where(x => x.Status.Equals(request.Status, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        var userId = _currentUser.UserId;
        var upvotedIds = new HashSet<Guid>();

        if (userId.HasValue)
        {
            var myUpvotes = await _upvoteRepo.WhereAsync(x => x.UserId == userId.Value, ct);
            upvotedIds = myUpvotes.Select(x => x.FeatureRequestId).ToHashSet();
        }

        return all
            .OrderByDescending(x => x.UpvoteCount)
            .ThenByDescending(x => x.CreatedAt)
            .Select(x => new FeatureRequestDto(
                x.Id,
                x.UserId,
                x.Title,
                x.Description,
                x.Category,
                x.UpvoteCount,
                x.Status,
                x.CreatedAt,
                upvotedIds.Contains(x.Id)))
            .ToList()
            .AsReadOnly();
    }
}
