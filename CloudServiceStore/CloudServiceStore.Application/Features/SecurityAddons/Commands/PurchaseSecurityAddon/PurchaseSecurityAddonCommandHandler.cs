using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.SecurityAddons.Commands.PurchaseSecurityAddon;

public class PurchaseSecurityAddonCommandHandler : IRequestHandler<PurchaseSecurityAddonCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SecuritySubscription> _repo;
    private readonly ICurrentUserService _currentUser;

    public PurchaseSecurityAddonCommandHandler(
        IUnitOfWork uow,
        IRepository<SecuritySubscription> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(PurchaseSecurityAddonCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        if (request.UserId != userId)
            throw new UnauthorizedException("Không có quyền thực hiện thao tác này");

        var existing = await _repo.GetAllAsync(cancellationToken);
        var alreadyExists = existing.Any(s => 
            s.UserId == userId && 
            s.AddonType == request.AddonType && 
            s.TargetResourceId == request.TargetResourceId &&
            s.IsActive);

        if (alreadyExists)
            throw new ConflictException("Đã mua add-on này cho tài nguyên này");

        var subscription = new SecuritySubscription
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TargetResourceId = request.TargetResourceId,
            AddonType = request.AddonType,
            IsActive = true,
            SubscribedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(subscription, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return subscription.Id;
    }
}
