using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Commands.UpdatePromotion;

public class UpdatePromotionCommandHandler : IRequestHandler<UpdatePromotionCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Promotion> _promoRepo;

    public UpdatePromotionCommandHandler(IUnitOfWork uow, IRepository<Promotion> promoRepo)
    {
        _uow = uow;
        _promoRepo = promoRepo;
    }

    public async Task Handle(UpdatePromotionCommand request, CancellationToken ct)
    {
        if (request.EndDate <= request.StartDate)
            throw new BadRequestException("Ngày kết thúc phải lớn hơn ngày bắt đầu.");

        var promotion = await _promoRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException($"Khuyến mãi {request.Id} không tồn tại.");

        promotion.ServicePlanId = request.ServicePlanId;
        promotion.DiscountPercent = request.DiscountPercent;
        promotion.StartDate = request.StartDate;
        promotion.EndDate = request.EndDate;

        _promoRepo.Update(promotion);
        await _uow.SaveChangesAsync(ct);
    }
}
