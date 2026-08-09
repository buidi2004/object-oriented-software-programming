using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class AffiliateApplication
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // Non-nullable
    public string CompanyName { get; set; } = null!;
    public AffiliateStatus Status { get; set; }
    public decimal CommissionRate { get; set; }
    
    public AppUser User { get; set; } = null!;
}
