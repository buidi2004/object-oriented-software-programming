using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.HostingAccounts.Queries.GetMyHostingAccounts;

public class GetMyHostingAccountsQueryHandler : IRequestHandler<GetMyHostingAccountsQuery, IEnumerable<HostingAccountDto>>
{
    private readonly IRepository<HostingAccount> _repo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyHostingAccountsQueryHandler(
        IRepository<HostingAccount> repo,
        IRepository<AppUser> userRepo,
        ICurrentUserService currentUser)
    {
        _repo = repo;
        _userRepo = userRepo;
        _currentUser = currentUser;
    }

    public async Task<IEnumerable<HostingAccountDto>> Handle(GetMyHostingAccountsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var accounts = await _repo.GetAllAsync(cancellationToken);
        var userAccounts = accounts.Where(a => a.UserId == userId && a.IsActive);

        var result = new List<HostingAccountDto>();
        foreach (var account in userAccounts)
        {
            var user = await _userRepo.GetByIdAsync(account.UserId, cancellationToken);
            result.Add(new HostingAccountDto
            {
                Id = account.Id,
                UserId = account.UserId,
                PlanId = account.PlanId,
                ContainerId = account.ContainerId,
                ControlPanelUrl = account.ControlPanelUrl,
                DiskUsedGb = account.DiskUsedGb,
                IsActive = account.IsActive,
                CreatedAt = account.CreatedAt,
                ExpiresAt = account.ExpiresAt,
                UserName = user?.FullName ?? "Unknown"
            });
        }

        return result;
    }
}
