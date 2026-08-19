using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class MarketplaceListing : AggregateRoot
{
    public Guid SellerId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public string PreviewImage { get; set; } = string.Empty;
    public MarketplaceListingStatus Status { get; private set; } = MarketplaceListingStatus.PendingReview;
    public string IdempotencyKey { get; set; } = string.Empty;
    public string FailureReason { get; private set; } = string.Empty;
    public int Downloads { get; set; }
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public void MarkAsActive()
    {
        if (Status != MarketplaceListingStatus.PendingReview && Status != MarketplaceListingStatus.Suspended)
            throw new InvalidOperationException($"Không thể duyệt (Active) từ trạng thái {Status}");
        Status = MarketplaceListingStatus.Active;
    }

    public void MarkAsSuspended(string reason)
    {
        Status = MarketplaceListingStatus.Suspended;
        FailureReason = reason;
    }

    public void MarkAsFailed(string reason)
    {
        Status = MarketplaceListingStatus.Failed;
        FailureReason = reason;
    }
}

public class MarketplacePurchase : AggregateRoot
{
    public Guid ListingId { get; set; }
    public Guid BuyerId { get; set; }
    public Guid PaymentId { get; set; }
    public MarketplacePurchaseStatus Status { get; set; }
    public string DownloadUrl { get; set; } = string.Empty;
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
}
