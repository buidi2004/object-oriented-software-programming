using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.StaticSites.Commands.DeployStaticSite;

public class DeployStaticSiteCommandHandler : IRequestHandler<DeployStaticSiteCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<StaticSite> _repo;
    private readonly ICurrentUserService _currentUser;

    public DeployStaticSiteCommandHandler(
        IUnitOfWork uow,
        IRepository<StaticSite> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(DeployStaticSiteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var site = await _repo.GetByIdAsync(request.SiteId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy trang tĩnh");

        if (site.UserId != userId)
            throw new UnauthorizedException("Không có quyền thực hiện thao tác này");

        var deploy = new StaticDeploy
        {
            Id = Guid.NewGuid(),
            StaticSiteId = request.SiteId,
            GitCommitHash = request.GitCommitHash,
            Status = DeployStatus.Success,
            StartedAt = DateTime.UtcNow,
            FinishedAt = DateTime.UtcNow.AddSeconds(new Random().Next(10, 60))
        };

        site.TotalDeploys++;
        site.DeployUrl = $"https://{request.SiteId}.staticcloud.vn";

        // In production: integrate with Vercel/Netlify API
        // Mock deployment URL generation
        _repo.Update(site);
        await _uow.SaveChangesAsync(cancellationToken);

        return deploy.Id;
    }
}
