using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.StorageBuckets.Commands.CreateBucket;

public record CreateBucketCommand(string Name, BucketVisibility Visibility = BucketVisibility.Private) : IRequest<Guid>;

public class CreateBucketCommandHandler : IRequestHandler<CreateBucketCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<StorageBucket> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateBucketCommandHandler(
        IUnitOfWork uow,
        IRepository<StorageBucket> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateBucketCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var bucket = new StorageBucket
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Visibility = request.Visibility
        };

        await _repo.AddAsync(bucket, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return bucket.Id;
    }
}
