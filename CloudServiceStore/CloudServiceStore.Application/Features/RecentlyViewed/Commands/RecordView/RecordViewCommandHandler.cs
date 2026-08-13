using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.RecentlyViewed.Commands.RecordView;

public class RecordViewCommandHandler : IRequestHandler<RecordViewCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<RecentlyViewedItem> _repo;
    private readonly ICurrentUserService _currentUser;

    public RecordViewCommandHandler(IUnitOfWork uow, IRepository<RecentlyViewedItem> repo, ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task Handle(RecordViewCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");

        var existingItem = await _repo.FirstOrDefaultAsync(x => x.UserId == userId && x.ServicePlanId == request.ServicePlanId, ct);

        if (existingItem != null)
        {
            existingItem.ViewedAt = DateTime.UtcNow;
            _repo.Update(existingItem);
        }
        else
        {
            var newItem = new RecentlyViewedItem
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                ServicePlanId = request.ServicePlanId,
                ViewedAt = DateTime.UtcNow
            };
            await _repo.AddAsync(newItem, ct);
        }

        await _uow.SaveChangesAsync(ct);
    }
}
