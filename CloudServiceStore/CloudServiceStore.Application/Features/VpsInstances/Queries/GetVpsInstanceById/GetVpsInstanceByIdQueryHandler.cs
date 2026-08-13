using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.VpsInstances.Queries.GetVpsInstanceById;

public class GetVpsInstanceByIdQueryHandler : IRequestHandler<GetVpsInstanceByIdQuery, VpsInstance?>
{
    private readonly IRepository<VpsInstance> _vpsRepo;

    public GetVpsInstanceByIdQueryHandler(IRepository<VpsInstance> vpsRepo)
    {
        _vpsRepo = vpsRepo;
    }

    public async Task<VpsInstance?> Handle(GetVpsInstanceByIdQuery request, CancellationToken cancellationToken)
    {
        return await _vpsRepo.GetByIdAsync(request.Id, cancellationToken);
    }
}
