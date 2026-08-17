using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.DatabaseInstances.Commands.CreateDatabaseInstance;

public record CreateDatabaseInstanceCommand(string Name, DatabaseEngine Engine) : IRequest<Guid>;

public class CreateDatabaseInstanceCommandHandler : IRequestHandler<CreateDatabaseInstanceCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<DatabaseInstance> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateDatabaseInstanceCommandHandler(
        IUnitOfWork uow,
        IRepository<DatabaseInstance> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateDatabaseInstanceCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var instance = new DatabaseInstance
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Engine = request.Engine,
            Version = request.Engine == DatabaseEngine.MySQL ? "8.0" : "15",
            Port = request.Engine == DatabaseEngine.MySQL ? 3306 : 5432,
            Status = DatabaseInstanceStatus.Creating
        };

        await _repo.AddAsync(instance, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return instance.Id;
    }
}
