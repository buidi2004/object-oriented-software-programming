using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class DnsRecord : AggregateRoot
{
    public Guid DomainId { get; set; }
    public string Type { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Value { get; set; } = null!;
    public int TTL { get; set; }
    
    public DomainRecord Domain { get; set; } = null!;
}
