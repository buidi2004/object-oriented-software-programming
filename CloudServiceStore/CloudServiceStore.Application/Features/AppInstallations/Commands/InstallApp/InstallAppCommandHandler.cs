using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.AppInstallations.Commands.InstallApp;

public class InstallAppCommandHandler : IRequestHandler<InstallAppCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AppInstallation> _repo;
    private readonly IRepository<AppTemplate> _templateRepo;
    private readonly IRepository<HostingAccount> _hostingRepo;
    private readonly ICurrentUserService _currentUser;

    public InstallAppCommandHandler(
        IUnitOfWork uow,
        IRepository<AppInstallation> repo,
        IRepository<AppTemplate> templateRepo,
        IRepository<HostingAccount> hostingRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _templateRepo = templateRepo;
        _hostingRepo = hostingRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(InstallAppCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var template = await _templateRepo.GetByIdAsync(request.TemplateId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy ứng dụng");

        var hosting = await _hostingRepo.GetByIdAsync(request.HostingAccountId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy hosting account");

        if (hosting.UserId != userId)
            throw new UnauthorizedException("Bạn không sở hữu hosting này");

        var installation = new AppInstallation
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TemplateId = request.TemplateId,
            HostingAccountId = request.HostingAccountId,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(installation, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return installation.Id;
    }
}
