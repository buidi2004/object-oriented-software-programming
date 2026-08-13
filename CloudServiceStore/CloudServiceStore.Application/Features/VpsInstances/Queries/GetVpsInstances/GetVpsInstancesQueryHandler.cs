using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;

namespace CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstances;

public class GetVpsInstancesQueryHandler : IRequestHandler<GetVpsInstancesQuery, IEnumerable<VpsInstance>>
{
    private readonly IRepository<VpsInstance> _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetVpsInstancesQueryHandler(IRepository<VpsInstance> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<VpsInstance>> Handle(GetVpsInstancesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            return Enumerable.Empty<VpsInstance>();
        }
        
        // Ensure we load them sorted by CreatedAt descending
        var allInstances = await _repository.GetAllAsync();
        return allInstances
            .Where(x => x.UserId == _currentUserService.UserId.Value)
            .OrderByDescending(x => x.CreatedAt)
            .ToList();
    }
}
