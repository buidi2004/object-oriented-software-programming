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
    private readonly ICatalogCache _catalogCache;

    public CreatePromotionCommandHandler(
        IUnitOfWork uow,
        IRepository<Promotion> promoRepo,
        ICatalogCache catalogCache)
    {
        _uow = uow;
        _promoRepo = promoRepo;
        _catalogCache = catalogCache;
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
        await _catalogCache.InvalidateCatalogAsync(ct);

        return promotion.Id;
    }
}
