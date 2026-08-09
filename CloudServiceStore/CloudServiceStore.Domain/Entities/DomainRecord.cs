using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class DomainRecord
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public Guid OrderRequestId { get; set; }
    public DateTime ExpiryDate { get; set; }
    public bool AutoRenew { get; set; }
    public DomainStatus Status { get; set; }
    
    public AppUser User { get; set; } = null!;
    public OrderRequest OrderRequest { get; set; } = null!;
}
