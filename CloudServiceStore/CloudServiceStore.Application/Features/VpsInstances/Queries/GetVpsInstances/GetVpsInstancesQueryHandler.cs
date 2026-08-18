using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstances;

public class GetVpsInstancesQueryHandler : IRequestHandler<GetVpsInstancesQuery, IEnumerable<VpsInstanceDto>>
{
    private readonly IRepository<VpsInstance> _repository;
    private readonly IRepository<AppUser> _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetVpsInstancesQueryHandler(
        IRepository<VpsInstance> repository,
        IRepository<AppUser> userRepository,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<VpsInstanceDto>> Handle(GetVpsInstancesQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<VpsInstance> instances;

        if (request.AdminAll)
        {
            if (!_currentUserService.IsInRole("Admin"))
            {
                throw new UnauthorizedException("Chỉ admin mới xem được toàn bộ VPS.");
            }

            var all = await _repository.GetAllAsync(cancellationToken);
            instances = all.OrderByDescending(x => x.CreatedAt).ToList();
        }
        else
        {
            if (_currentUserService.UserId == null)
            {
                return Enumerable.Empty<VpsInstanceDto>();
            }

            var userVps = await _repository.WhereAsync(x => x.UserId == _currentUserService.UserId.Value, cancellationToken);
            instances = userVps.OrderByDescending(x => x.CreatedAt).ToList();
        }

        var userIds = instances.Select(x => x.UserId).Distinct().ToList();
        var users = await _userRepository.WhereAsync(u => userIds.Contains(u.Id), cancellationToken);
        var userMap = users.ToDictionary(u => u.Id, u => u.Email);

        return instances
            .Select(instance => VpsInstanceMapper.ToDto(
                instance,
                userMap.TryGetValue(instance.UserId, out var email) ? email : null))
            .ToList();
    }
}
