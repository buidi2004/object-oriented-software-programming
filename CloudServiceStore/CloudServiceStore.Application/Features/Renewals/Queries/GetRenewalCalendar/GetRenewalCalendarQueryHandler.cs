using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Renewals.Queries.GetRenewalCalendar;

public class GetRenewalCalendarQueryHandler : IRequestHandler<GetRenewalCalendarQuery, IReadOnlyList<RenewalEventDto>>
{
    private readonly IRepository<VpsInstance> _vpsRepo;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IRepository<SslCertificate> _sslRepo;
    private readonly ICurrentUserService _currentUser;

    public GetRenewalCalendarQueryHandler(
        IRepository<VpsInstance> vpsRepo,
        IRepository<DomainRecord> domainRepo,
        IRepository<SslCertificate> sslRepo,
        ICurrentUserService currentUser)
    {
        _vpsRepo = vpsRepo;
        _domainRepo = domainRepo;
        _sslRepo = sslRepo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<RenewalEventDto>> Handle(GetRenewalCalendarQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");
        var month = request.Month ?? DateTime.UtcNow.Month;
        var year = request.Year ?? DateTime.UtcNow.Year;

        var start = new DateTime(year, month, 1, 0, 0, 0, DateTimeKind.Utc);
        var end = start.AddMonths(1);

        var result = new List<RenewalEventDto>();

        var vpsList = await _vpsRepo.WhereAsync(
            x => x.UserId == userId && x.ExpiresAt >= start && x.ExpiresAt < end,
            ct);

        result.AddRange(vpsList.Select(v => new RenewalEventDto(
            "VPS",
            string.IsNullOrWhiteSpace(v.PlanName) ? $"VPS {v.Id}" : v.PlanName,
            v.ExpiresAt,
            0m,
            false)));

        var domainsInMonth = await _domainRepo.WhereAsync(
            x => x.UserId == userId && x.ExpiryDate >= start && x.ExpiryDate < end,
            ct);

        result.AddRange(domainsInMonth.Select(d => new RenewalEventDto(
            "Domain",
            d.Name,
            d.ExpiryDate,
            0m,
            d.AutoRenew)));

        var allUserDomains = await _domainRepo.WhereAsync(x => x.UserId == userId, ct);
        var ownedDomainIds = allUserDomains.Select(d => d.Id).ToHashSet();
        var sslList = await _sslRepo.WhereAsync(
            x => x.ExpiryDate != null && x.ExpiryDate >= start && x.ExpiryDate < end,
            ct);

        result.AddRange(
            sslList
                .Where(s => ownedDomainIds.Contains(s.DomainId) && s.ExpiryDate.HasValue)
                .Select(s => new RenewalEventDto(
                    "SSL",
                    $"SSL for {allUserDomains.FirstOrDefault(d => d.Id == s.DomainId)?.Name ?? s.DomainId.ToString()}",
                    s.ExpiryDate!.Value,
                    0m,
                    false)));

        return result
            .OrderBy(x => x.ExpiryDate)
            .ToList()
            .AsReadOnly();
    }
}
