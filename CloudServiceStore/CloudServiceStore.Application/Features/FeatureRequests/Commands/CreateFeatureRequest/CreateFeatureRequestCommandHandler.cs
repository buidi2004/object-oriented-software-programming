using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.FeatureRequests.Commands.CreateFeatureRequest;

public class CreateFeatureRequestCommandHandler : IRequestHandler<CreateFeatureRequestCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<FeatureRequest> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateFeatureRequestCommandHandler(
        IUnitOfWork uow,
        IRepository<FeatureRequest> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateFeatureRequestCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");
        var entity = new FeatureRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim(),
            Status = "UnderReview",
            UpvoteCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(entity, ct);
        await _uow.SaveChangesAsync(ct);
        return entity.Id;
    }
}
