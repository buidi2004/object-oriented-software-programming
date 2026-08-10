using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.RecentlyViewed.Commands.AddRecentlyViewed;

public class AddRecentlyViewedCommandHandler : IRequestHandler<AddRecentlyViewedCommand, bool>
{
    private readonly IRepository<CloudServiceStore.Domain.Entities.RecentlyViewed> _repository;
    private readonly ICurrentUserService _currentUserService;

    public AddRecentlyViewedCommandHandler(IRepository<CloudServiceStore.Domain.Entities.RecentlyViewed> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(AddRecentlyViewedCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
            return false;

        var existing = (await _repository.WhereAsync(r => r.UserId == _currentUserService.UserId.Value && r.ServicePlanId == request.ServicePlanId, cancellationToken)).FirstOrDefault();

        if (existing != null)
        {
            existing.UpdateViewTime();
            _repository.Update(existing);
        }
        else
        {
            var viewed = new CloudServiceStore.Domain.Entities.RecentlyViewed(_currentUserService.UserId.Value, request.ServicePlanId);
            await _repository.AddAsync(viewed, cancellationToken);
        }
        
        return true;
    }
}
