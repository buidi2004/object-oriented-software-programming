using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.SecurityAddons.Queries.GetMySecurityAddons;

public record GetMySecurityAddonsQuery() : IRequest<IEnumerable<SecuritySubscription>>;

public class GetMySecurityAddonsQueryHandler : IRequestHandler<GetMySecurityAddonsQuery, IEnumerable<SecuritySubscription>>
{
    private readonly IRepository<SecuritySubscription> _repo;
    private readonly ICurrentUserService _currentUser;

    public GetMySecurityAddonsQueryHandler(
        IRepository<SecuritySubscription> repo,
        ICurrentUserService currentUser)
    {
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<IEnumerable<SecuritySubscription>> Handle(GetMySecurityAddonsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        return await _repo.GetAllAsync(cancellationToken);
    }
}
