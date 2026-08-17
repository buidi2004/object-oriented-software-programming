using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class MarketplaceListing : AggregateRoot
{
    public Guid SellerId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Category { get; set; } = string.Empty;
    public string PreviewImage { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int Downloads { get; set; }
    public int Rating { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
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
