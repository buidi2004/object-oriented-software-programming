using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Affiliates.Queries.GetAllApplications;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Affiliates.Queries.GetMyApplication;

public class GetMyAffiliateApplicationQueryHandler : IRequestHandler<GetMyAffiliateApplicationQuery, AffiliateApplicationDto?>
{
    private readonly IRepository<AffiliateApplication> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMyAffiliateApplicationQueryHandler(IRepository<AffiliateApplication> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<AffiliateApplicationDto?> Handle(GetMyAffiliateApplicationQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("User not authenticated.");

        var apps = await _repo.WhereAsync(a => a.UserId == userId, ct);
        var latest = apps.OrderByDescending(a => a.Id).FirstOrDefault(); // or ordering by date if available

        if (latest == null) return null;

        return new AffiliateApplicationDto(
            latest.Id, latest.UserId, latest.CompanyName, latest.Status.ToString(), latest.CommissionRate
        );
    }
}
