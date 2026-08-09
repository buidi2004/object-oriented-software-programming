using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Commands.DeleteDnsRecord;

public class DeleteDnsRecordCommandHandler : IRequestHandler<DeleteDnsRecordCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IRepository<DnsRecord> _dnsRepo;
    private readonly ICurrentUserService _currentUser;

    public DeleteDnsRecordCommandHandler(IUnitOfWork uow, IRepository<DomainRecord> domainRepo, IRepository<DnsRecord> dnsRepo, ICurrentUserService currentUser)
    { _uow = uow; _domainRepo = domainRepo; _dnsRepo = dnsRepo; _currentUser = currentUser; }

    public async Task Handle(DeleteDnsRecordCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var domain = await _domainRepo.GetByIdAsync(request.DomainId, cancellationToken)
            ?? throw new NotFoundException("Tên miền không tồn tại.");
            
        if (domain.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền xoá bản ghi DNS của tên miền này.");

        var record = await _dnsRepo.GetByIdAsync(request.RecordId, cancellationToken)
            ?? throw new NotFoundException("Bản ghi DNS không tồn tại.");
            
        if (record.DomainId != request.DomainId)
            throw new NotFoundException("Bản ghi DNS không thuộc tên miền này.");

        _dnsRepo.Delete(record);
        await _uow.SaveChangesAsync(cancellationToken);
    }
}
