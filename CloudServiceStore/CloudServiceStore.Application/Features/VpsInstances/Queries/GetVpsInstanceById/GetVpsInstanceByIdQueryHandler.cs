using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstanceById;

public class GetVpsInstanceByIdQueryHandler : IRequestHandler<GetVpsInstanceByIdQuery, VpsInstanceDto?>
{
    private readonly IRepository<Domain.Entities.VpsInstance> _vpsRepo;
    private readonly ICurrentUserService _currentUserService;

    public GetVpsInstanceByIdQueryHandler(
        IRepository<Domain.Entities.VpsInstance> vpsRepo,
        ICurrentUserService currentUserService)
    {
        _vpsRepo = vpsRepo;
        _currentUserService = currentUserService;
    }

    public async Task<VpsInstanceDto?> Handle(GetVpsInstanceByIdQuery request, CancellationToken cancellationToken)
    {
        var instance = await _vpsRepo.GetByIdAsync(request.Id, cancellationToken);
        if (instance == null)
        {
            return null;
        }

        if (_currentUserService.UserId.HasValue
            && instance.UserId != _currentUserService.UserId.Value
            && !_currentUserService.IsInRole("Admin"))
        {
            throw new UnauthorizedException("Bạn không có quyền xem VPS này.");
        }

        return VpsInstanceMapper.ToDto(instance);
    }
}
