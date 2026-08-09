using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public AuditAction Action { get; set; }
    public string EntityName { get; set; } = null!;
    public string EntityId { get; set; } = null!;
    public string IpAddress { get; set; } = null!; // varchar(45) for IPv6
    public DateTime Timestamp { get; set; }
    
    public AppUser? User { get; set; }
}
