using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class ServiceTagNote : AggregateRoot
{
    public Guid UserId { get; set; }
    public string ServiceType { get; set; } = string.Empty;
    public Guid ServiceId { get; set; }
    public string? TagsJson { get; set; }
    public string? ColorHex { get; set; }
    public string? Note { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
