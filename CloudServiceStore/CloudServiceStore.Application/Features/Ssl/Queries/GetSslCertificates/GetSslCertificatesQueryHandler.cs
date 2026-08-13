using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;

namespace CloudServiceStore.Application.Features.Ssl.Queries.GetSslCertificates;

public class GetSslCertificatesQueryHandler : IRequestHandler<GetSslCertificatesQuery, IEnumerable<SslCertificate>>
{
    private readonly IRepository<SslCertificate> _sslRepository;
    private readonly IRepository<DomainRecord> _domainRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetSslCertificatesQueryHandler(
        IRepository<SslCertificate> sslRepository, 
        IRepository<DomainRecord> domainRepository,
        ICurrentUserService currentUserService)
    {
        _sslRepository = sslRepository;
        _domainRepository = domainRepository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<SslCertificate>> Handle(GetSslCertificatesQuery request, CancellationToken cancellationToken)
    {
        if (_currentUserService.UserId == null)
        {
            return Enumerable.Empty<SslCertificate>();
        }
        
        var userDomains = (await _domainRepository.GetAllAsync())
            .Where(d => d.UserId == _currentUserService.UserId.Value)
            .Select(d => d.Id)
            .ToHashSet();
            
        var allSsls = await _sslRepository.GetAllAsync();
        return allSsls
            .Where(s => userDomains.Contains(s.DomainId))
            .OrderByDescending(s => s.ExpiryDate)
            .ToList();
    }
}
