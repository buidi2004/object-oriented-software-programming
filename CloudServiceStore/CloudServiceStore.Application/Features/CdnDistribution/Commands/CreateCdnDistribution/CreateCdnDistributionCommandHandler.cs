using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.CdnDistribution.Commands.CreateCdnDistribution;

public class CreateCdnDistributionCommandHandler : IRequestHandler<CreateCdnDistributionCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Domain.Entities.CdnDistribution> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateCdnDistributionCommandHandler(
        IUnitOfWork uow,
        IRepository<Domain.Entities.CdnDistribution> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateCdnDistributionCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var distribution = new Domain.Entities.CdnDistribution
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OriginUrl = request.OriginUrl,
            Cname = $"{Guid.NewGuid().ToString("N")[..8]}.cdncloud.vn",
            HttpsEnabled = true,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(distribution, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return distribution.Id;
    }
}
