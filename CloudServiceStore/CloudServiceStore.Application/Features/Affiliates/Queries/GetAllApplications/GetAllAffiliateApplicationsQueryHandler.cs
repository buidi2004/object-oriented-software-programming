using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Affiliates.Queries.GetAllApplications;

public class GetAllAffiliateApplicationsQueryHandler : IRequestHandler<GetAllAffiliateApplicationsQuery, IReadOnlyList<AffiliateApplicationDto>>
{
    private readonly IRepository<AffiliateApplication> _repo;

    public GetAllAffiliateApplicationsQueryHandler(IRepository<AffiliateApplication> repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<AffiliateApplicationDto>> Handle(GetAllAffiliateApplicationsQuery request, CancellationToken ct)
    {
        var apps = await _repo.GetAllAsync(ct);

        return apps.Select(a => new AffiliateApplicationDto(
            a.Id, a.UserId, a.CompanyName, a.Status.ToString(), a.CommissionRate
        )).ToList().AsReadOnly();
    }
}
