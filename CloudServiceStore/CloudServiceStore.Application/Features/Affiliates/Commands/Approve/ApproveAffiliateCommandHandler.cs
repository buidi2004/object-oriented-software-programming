using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Affiliates.Commands.Approve;

public class ApproveAffiliateCommandHandler : IRequestHandler<ApproveAffiliateCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<AffiliateApplication> _repo;

    public ApproveAffiliateCommandHandler(IUnitOfWork uow, IRepository<AffiliateApplication> repo)
    {
        _uow = uow;
        _repo = repo;
    }

    public async Task Handle(ApproveAffiliateCommand request, CancellationToken ct)
    {
        var app = await _repo.GetByIdAsync(request.ApplicationId, ct)
            ?? throw new NotFoundException($"Đơn đăng ký affiliate {request.ApplicationId} không tồn tại.");

        app.Status = AffiliateStatus.Approved;
        _repo.Update(app);
        await _uow.SaveChangesAsync(ct);
    }
}
