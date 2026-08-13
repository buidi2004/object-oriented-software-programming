using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Affiliates.Commands.CreateApplication;

public class CreateAffiliateApplicationCommandHandler : IRequestHandler<CreateAffiliateApplicationCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AffiliateApplication> _repo;
    private readonly ICurrentUserService _currentUser;

    public CreateAffiliateApplicationCommandHandler(
        IUnitOfWork uow,
        IRepository<AffiliateApplication> repo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _repo = repo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateAffiliateApplicationCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var hasPending = await _repo.AnyAsync(a => a.UserId == userId && a.Status == AffiliateStatus.Pending, ct);
        if (hasPending)
            throw new ConflictException("Bạn đã có đơn đăng ký affiliate đang chờ duyệt.");

        var application = new AffiliateApplication
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            CompanyName = request.CompanyName,
            CommissionRate = request.CommissionRate,
            Status = AffiliateStatus.Pending
        };

        await _repo.AddAsync(application, ct);
        await _uow.SaveChangesAsync(ct);

        return application.Id;
    }
}
