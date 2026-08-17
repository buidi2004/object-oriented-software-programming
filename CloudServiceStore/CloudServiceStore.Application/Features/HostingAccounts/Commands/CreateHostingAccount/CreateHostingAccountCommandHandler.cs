using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.HostingAccounts.Commands.CreateHostingAccount;

public class CreateHostingAccountCommandHandler : IRequestHandler<CreateHostingAccountCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<HostingAccount> _repo;
    private readonly IRepository<HostingPlan> _planRepo;
    private readonly ICurrentUserService _currentUser;

    public CreateHostingAccountCommandHandler(
        IUnitOfWork uow,
        IRepository<HostingAccount> repo,
        IRepository<HostingPlan> planRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _planRepo = planRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateHostingAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var plan = await _planRepo.GetByIdAsync(request.PlanId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy gói hosting");

        var account = new HostingAccount
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PlanId = request.PlanId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddYears(1),
            IsActive = true
        };

        await _repo.AddAsync(account, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return account.Id;
    }
}
