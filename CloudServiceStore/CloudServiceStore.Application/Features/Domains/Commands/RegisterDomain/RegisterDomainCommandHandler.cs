using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Commands.RegisterDomain;

public class RegisterDomainCommandHandler : IRequestHandler<RegisterDomainCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly ICurrentUserService _currentUser;

    public RegisterDomainCommandHandler(IUnitOfWork uow, IRepository<DomainRecord> domainRepo, IRepository<OrderRequest> orderRepo, ICurrentUserService currentUser)
    { _uow = uow; _domainRepo = domainRepo; _orderRepo = orderRepo; _currentUser = currentUser; }

    public async Task<Guid> Handle(RegisterDomainCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var existingDomain = await _domainRepo.FirstOrDefaultAsync(d => d.Name == request.DomainName, cancellationToken);
        if (existingDomain != null) throw new ConflictException("Tên miền đã được đăng ký bởi người khác.");

        var order = await _orderRepo.GetByIdAsync(request.OrderRequestId, cancellationToken) 
            ?? throw new NotFoundException("Đơn hàng không tồn tại.");

        if (order.Status != OrderStatus.Paid) throw new ConflictException("Đơn hàng chưa được thanh toán.");

        var domain = new DomainRecord
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.DomainName,
            OrderRequestId = order.Id,
            ExpiryDate = DateTime.UtcNow.AddYears(1),
            AutoRenew = true,
            Status = DomainStatus.Active
        };

        await _domainRepo.AddAsync(domain, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return domain.Id;
    }
}
