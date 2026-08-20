using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.AppInstallations.Queries.GetMyAppInstallations;

public record GetMyAppInstallationsQuery() : IRequest<IEnumerable<AppInstallation>>;

public class GetMyAppInstallationsQueryHandler : IRequestHandler<GetMyAppInstallationsQuery, IEnumerable<AppInstallation>>
{
    private readonly IRepository<AppInstallation> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMyAppInstallationsQueryHandler(IRepository<AppInstallation> repo, ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<IEnumerable<AppInstallation>> Handle(GetMyAppInstallationsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var all = await _repo.GetAllAsync(cancellationToken);
        return all.Where(x => x.UserId == userId);
    }
}
