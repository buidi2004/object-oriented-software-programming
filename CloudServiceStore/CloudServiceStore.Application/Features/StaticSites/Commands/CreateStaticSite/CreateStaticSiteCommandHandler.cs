using CloudServiceStore.Application.Exceptions;
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

    public CreateStaticSiteCommandHandler(
        IUnitOfWork uow,
        IRepository<StaticSite> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateStaticSiteCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var site = new StaticSite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            BuildCommand = request.BuildCommand,
            OutputDirectory = request.OutputDirectory,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(site, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return site.Id;
    }
}
