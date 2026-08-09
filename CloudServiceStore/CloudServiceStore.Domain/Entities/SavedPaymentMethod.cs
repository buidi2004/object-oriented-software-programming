using System;

namespace CloudServiceStore.Domain.Entities;

public class SavedPaymentMethod
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Gateway { get; set; } = null!;    // e.g. "VNPAY", "MOMO", "PAYPAL"
    public string MaskedInfo { get; set; } = null!; // e.g. "**** **** **** 1234"
    public bool IsDefault { get; set; } = false;
    public DateTime CreatedAt { get; set; }

    public AppUser User { get; set; } = null!;
}
