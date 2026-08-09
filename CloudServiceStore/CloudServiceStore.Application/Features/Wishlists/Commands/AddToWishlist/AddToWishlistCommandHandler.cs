using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Wishlists.Commands.AddToWishlist;

public class AddToWishlistCommandHandler : IRequestHandler<AddToWishlistCommand, Guid>
{
    private readonly IRepository<WishlistItem> _repo;
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public AddToWishlistCommandHandler(
        IRepository<WishlistItem> repo,
        IRepository<ServicePlan> planRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUser)
    {
        _repo = repo;
        _planRepo = planRepo;
        _uow = uow;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddToWishlistCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        var plan = await _planRepo.GetByIdAsync(request.ServicePlanId, cancellationToken);
        if (plan == null) throw new NotFoundException(nameof(ServicePlan), request.ServicePlanId);

        var existing = await _repo.FirstOrDefaultAsync(w => w.UserId == userId && w.ServicePlanId == request.ServicePlanId, cancellationToken);
        if (existing != null) throw new ConflictException("Service plan is already in your wishlist.");

        var item = new WishlistItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ServicePlanId = request.ServicePlanId,
            AddedAt = DateTime.UtcNow
        };

        await _repo.AddAsync(item, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return item.Id;
    }
}
