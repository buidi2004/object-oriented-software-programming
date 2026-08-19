using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.StaticSites.Commands.CreateStaticSite;

public class CreateStaticSiteCommandHandler : IRequestHandler<CreateStaticSiteCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<StaticSite> _repo;
    private readonly ICurrentUserService _currentUser;
    private readonly IStaticSiteProvisioningService _provisioningService;

    public CreateStaticSiteCommandHandler(
        IUnitOfWork uow,
        IRepository<StaticSite> repo,
        ICurrentUserService currentUser,
        IStaticSiteProvisioningService provisioningService)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
        _provisioningService = provisioningService;
    }

    public async Task<Guid> Handle(CreateStaticSiteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId.GetValueOrDefault();

        // 1. Idempotency Check
        var existing = await _repo.FirstOrDefaultAsync(x => x.IdempotencyKey == request.IdempotencyKey, cancellationToken);
        if (existing != null)
        {
            return existing.Id;
        }

        // 2. Tạo Entity (State: Pending -> Provisioning)
        var staticSite = new StaticSite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            IdempotencyKey = request.IdempotencyKey
        };

        staticSite.MarkAsProvisioning();

        await _repo.AddAsync(staticSite, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        // 3. Gọi CI/CD (Provisioning)
        bool success = await _provisioningService.ProvisionProjectAsync(staticSite, cancellationToken);

        if (success)
        {
            staticSite.MarkAsActive();
        }
        else
        {
            staticSite.MarkAsFailed("Lỗi tạo Project trên CI/CD.");
        }

        await _uow.SaveChangesAsync(cancellationToken);

        return staticSite.Id;
    }
}
