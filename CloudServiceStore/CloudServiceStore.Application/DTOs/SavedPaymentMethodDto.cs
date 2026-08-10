using System;

namespace CloudServiceStore.Application.DTOs;

public class SavedPaymentMethodDto
{
    public Guid Id { get; set; }
    public string Gateway { get; set; } = null!;
    public string MaskedInfo { get; set; } = null!;
    public bool IsDefault { get; set; }
    public DateTime CreatedAt { get; set; }
}
