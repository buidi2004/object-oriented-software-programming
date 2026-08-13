using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Commands.CreatePromotion;

public class CreatePromotionCommandHandler : IRequestHandler<CreatePromotionCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Promotion> _promoRepo;

    public CreatePromotionCommandHandler(IUnitOfWork uow, IRepository<Promotion> promoRepo)
    {
        _uow = uow;
        _promoRepo = promoRepo;
    }

    public async Task<Guid> Handle(CreatePromotionCommand request, CancellationToken ct)
    {
        if (request.EndDate <= request.StartDate)
            throw new BadRequestException("Ngày kết thúc phải lớn hơn ngày bắt đầu.");

        var promotion = new Promotion
        {
            Id = Guid.NewGuid(),
            ServicePlanId = request.ServicePlanId,
            DiscountPercent = request.DiscountPercent,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        await _promoRepo.AddAsync(promotion, ct);
        await _uow.SaveChangesAsync(ct);

        return promotion.Id;
    }
}
