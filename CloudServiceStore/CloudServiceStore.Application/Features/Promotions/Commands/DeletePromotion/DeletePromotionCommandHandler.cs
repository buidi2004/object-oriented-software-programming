using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Commands.DeletePromotion;

public class DeletePromotionCommandHandler : IRequestHandler<DeletePromotionCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Promotion> _promoRepo;
    private readonly ICatalogCache _catalogCache;

    public DeletePromotionCommandHandler(
        IUnitOfWork uow,
        IRepository<Promotion> promoRepo,
        ICatalogCache catalogCache)
    {
        _uow = uow;
        _promoRepo = promoRepo;
        _catalogCache = catalogCache;
    }

    public async Task Handle(DeletePromotionCommand request, CancellationToken ct)
    {
        var promotion = await _promoRepo.GetByIdAsync(request.Id, ct)
            ?? throw new NotFoundException($"Khuyến mãi {request.Id} không tồn tại.");

        _promoRepo.Delete(promotion);
        await _uow.SaveChangesAsync(ct);
        await _catalogCache.InvalidateCatalogAsync(ct);
    }
}
