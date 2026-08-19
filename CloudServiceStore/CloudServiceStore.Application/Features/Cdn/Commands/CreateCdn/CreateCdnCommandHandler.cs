using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Cdn.Commands.CreateCdn;

public class CreateCdnCommandHandler : IRequestHandler<CreateCdnCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<CloudServiceStore.Domain.Entities.CdnDistribution> _repo;
    private readonly ICurrentUserService _currentUser;
    private readonly ICdnProvisioningService _cdnService;

    public CreateCdnCommandHandler(
        IUnitOfWork uow,
        IRepository<CloudServiceStore.Domain.Entities.CdnDistribution> repo,
        ICurrentUserService currentUser,
        ICdnProvisioningService cdnService)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
        _cdnService = cdnService;
    }

    public async Task<Guid> Handle(CreateCdnCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId.GetValueOrDefault();

        // 1. Idempotency Check
        var existing = await _repo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        // 2. Tạo Entity (State: Pending -> Provisioning)
        var distribution = new CloudServiceStore.Domain.Entities.CdnDistribution
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OriginUrl = request.OriginUrl,
            IdempotencyKey = request.IdempotencyKey
        };

        distribution.MarkAsProvisioning();

        await _repo.AddAsync(distribution, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        // 3. Gọi Cloudflare API (Provisioning)
        string cname = await _cdnService.CreateDistributionAsync(distribution, cancellationToken);

        if (!string.IsNullOrEmpty(cname))
        {
            distribution.MarkAsActive(cname);
        }
        else
        {
            distribution.MarkAsFailed("Lỗi tạo Zone trên Cloudflare API.");
        }

        await _uow.SaveChangesAsync(cancellationToken);

        return distribution.Id;
    }
}
