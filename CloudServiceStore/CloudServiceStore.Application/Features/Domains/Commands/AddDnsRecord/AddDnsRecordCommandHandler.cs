using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Commands.AddDnsRecord;

public class AddDnsRecordCommandHandler : IRequestHandler<AddDnsRecordCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IRepository<DnsRecord> _dnsRepo;
    private readonly ICurrentUserService _currentUser;

    public AddDnsRecordCommandHandler(IUnitOfWork uow, IRepository<DomainRecord> domainRepo, IRepository<DnsRecord> dnsRepo, ICurrentUserService currentUser)
    { _uow = uow; _domainRepo = domainRepo; _dnsRepo = dnsRepo; _currentUser = currentUser; }

    public async Task<Guid> Handle(AddDnsRecordCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var domain = await _domainRepo.GetByIdAsync(request.DomainId, cancellationToken)
            ?? throw new NotFoundException("Tên miền không tồn tại.");
            
        if (domain.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền thêm bản ghi DNS cho tên miền này.");

        var record = new DnsRecord
        {
            Id = Guid.NewGuid(),
            DomainId = request.DomainId,
            Type = request.Type,
            Name = request.Name,
            Value = request.Value,
            TTL = request.TTL
        };

        await _dnsRepo.AddAsync(record, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return record.Id;
    }
}
