using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ApiKey : AggregateRoot
{
    public Guid UserId { get; set; }
    public string KeyHash { get; set; } = string.Empty;
    public string Scopes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
}
