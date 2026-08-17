using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.WebsiteBuilder.Commands.CreateProject;

public class CreateProjectCommandHandler : IRequestHandler<CreateProjectCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<WebsiteBuilderProject> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateProjectCommandHandler(
        IUnitOfWork uow,
        IRepository<WebsiteBuilderProject> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateProjectCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var project = new WebsiteBuilderProject
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            TemplateId = request.TemplateId,
            IsPublished = false,
            CreatedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(project, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return project.Id;
    }
}
