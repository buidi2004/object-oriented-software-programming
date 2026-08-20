using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.AppInstallations.Queries.GetAllAppInstallations;

public record GetAllAppInstallationsQuery() : IRequest<IEnumerable<AppInstallation>>;

public class GetAllAppInstallationsQueryHandler : IRequestHandler<GetAllAppInstallationsQuery, IEnumerable<AppInstallation>>
{
    private readonly IRepository<AppInstallation> _repo;

    public GetAllAppInstallationsQueryHandler(IRepository<AppInstallation> repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<AppInstallation>> Handle(GetAllAppInstallationsQuery request, CancellationToken cancellationToken)
    {
        return await _repo.GetAllAsync(cancellationToken);
    }
}
