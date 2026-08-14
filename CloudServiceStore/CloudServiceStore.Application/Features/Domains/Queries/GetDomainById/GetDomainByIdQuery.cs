using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Queries.GetDomainById;

public record DomainDetailDto(
    Guid Id,
    string Name,
    DateTime ExpiryDate,
    bool AutoRenew,
    string Status);

public record GetDomainByIdQuery(Guid Id) : IRequest<DomainDetailDto>;

public class GetDomainByIdQueryHandler : IRequestHandler<GetDomainByIdQuery, DomainDetailDto>
{
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly ICurrentUserService _currentUser;

    public GetDomainByIdQueryHandler(IRepository<DomainRecord> domainRepo, ICurrentUserService currentUser)
    {
        _domainRepo = domainRepo;
        _currentUser = currentUser;
    }

    public async Task<DomainDetailDto> Handle(GetDomainByIdQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var domain = await _domainRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Tên miền không tồn tại.");

        if (domain.UserId != userId)
            throw new UnauthorizedException("Bạn không có quyền xem tên miền này.");

        return new DomainDetailDto(
            domain.Id,
            domain.Name,
            domain.ExpiryDate,
            domain.AutoRenew,
            domain.Status.ToString().ToLower());
    }
}
