using System;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class VpsInstance : AggregateRoot
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    
    public string ContainerId { get; set; } = string.Empty;
    public string ContainerName { get; set; } = string.Empty;
    
    public VpsInstanceStatus Status { get; set; }
    
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }

    public OrderRequest? Order { get; set; }
    public AppUser? User { get; set; }
}
