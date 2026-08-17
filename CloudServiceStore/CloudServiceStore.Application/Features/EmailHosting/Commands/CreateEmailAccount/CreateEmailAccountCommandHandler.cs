using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.EmailHosting.Commands.CreateEmailAccount;

public class CreateEmailAccountCommandHandler : IRequestHandler<CreateEmailAccountCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<EmailHostingAccount> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateEmailAccountCommandHandler(
        IUnitOfWork uow,
        IRepository<EmailHostingAccount> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateEmailAccountCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var hosting = await _repo.GetByIdAsync(request.HostingAccountId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy tài khoản email hosting");

        if (hosting.UserId != userId)
            throw new UnauthorizedException("Không có quyền thực hiện thao tác này");

        // Mock: generate password
        var password = Guid.NewGuid().ToString("N")[..12];

        // In production: provision mailbox via mail API
        return Guid.NewGuid();
    }
}
