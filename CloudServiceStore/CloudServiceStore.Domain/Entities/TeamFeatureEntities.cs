using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class BillingAddress : AggregateRoot
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Company { get; set; }
    public string? TaxCode { get; set; }
    public string AddressLine { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PinnedService : AggregateRoot
{
    public Guid UserId { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public Guid ServiceId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public DateTime PinnedAt { get; set; } = DateTime.UtcNow;
}

public class TicketFeedback : AggregateRoot
{
    public Guid TicketId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }
    public string? TagsJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ServiceBundle : AggregateRoot
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal DiscountPercent { get; set; }
    public string IncludedPlanIdsJson { get; set; } = "[]";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class StockAlertSubscription : AggregateRoot
{
    public Guid UserId { get; set; }
    public Guid ServicePlanId { get; set; }
    public decimal? TargetPrice { get; set; }
    public bool NotifyWhenAvailable { get; set; } = true;
    public bool IsNotified { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class FreeTrialRequest : AggregateRoot
{
    public Guid UserId { get; set; }
    public Guid ServicePlanId { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public string Status { get; set; } = "Active";
    public Guid? VpsInstanceId { get; set; }
}

public class PlanPriceHistory : AggregateRoot
{
    public Guid ServicePlanId { get; set; }
    public decimal OldPrice { get; set; }
    public decimal NewPrice { get; set; }
    public string Currency { get; set; } = "VND";
    public string? Reason { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}

public class PlanQuestion : AggregateRoot
{
    public Guid ServicePlanId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class PlanAnswer : AggregateRoot
{
    public Guid QuestionId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsStaffAnswer { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
