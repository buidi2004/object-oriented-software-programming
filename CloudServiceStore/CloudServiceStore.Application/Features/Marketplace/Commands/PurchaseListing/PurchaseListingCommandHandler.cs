using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Marketplace.Commands.PurchaseListing;

public class PurchaseListingCommandHandler : IRequestHandler<PurchaseListingCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<MarketplaceListing> _listingRepo;
    private readonly IRepository<MarketplacePurchase> _purchaseRepo;
    private readonly ICurrentUserService _currentUser;

    public PurchaseListingCommandHandler(
        IUnitOfWork uow,
        IRepository<MarketplaceListing> listingRepo,
        IRepository<MarketplacePurchase> purchaseRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _listingRepo = listingRepo;
        _purchaseRepo = purchaseRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(PurchaseListingCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var listing = await _listingRepo.GetByIdAsync(request.ListingId, cancellationToken)
            ?? throw new NotFoundException("Không tìm thấy sản phẩm");

        if (listing.Status != CloudServiceStore.Domain.Enums.MarketplaceListingStatus.Active)
            throw new BadRequestException("Sản phẩm này không còn bán");

        var existingPurchase = await _purchaseRepo.GetAllAsync(cancellationToken);
        var alreadyPurchased = existingPurchase.Any(p =>
            p.BuyerId == userId && p.ListingId == request.ListingId && p.Status == MarketplacePurchaseStatus.Completed);

        if (alreadyPurchased)
            throw new ConflictException("Bạn đã mua sản phẩm này rồi");

        // Mock: process payment
        var purchase = new MarketplacePurchase
        {
            Id = Guid.NewGuid(),
            ListingId = request.ListingId,
            BuyerId = userId,
            PaymentId = Guid.NewGuid(),
            Status = MarketplacePurchaseStatus.Completed,
            DownloadUrl = $"https://cdn.marketplace.vn/download/{request.ListingId}/{userId}",
            PurchasedAt = DateTime.UtcNow
        };

        listing.Downloads++;
        _listingRepo.Update(listing);
        await _purchaseRepo.AddAsync(purchase, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return purchase.Id;
    }
}
