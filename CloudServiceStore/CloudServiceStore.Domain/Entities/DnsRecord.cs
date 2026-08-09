using System;

namespace CloudServiceStore.Domain.Entities;

public class DnsRecord
{
    public Guid Id { get; set; }
    public Guid DomainId { get; set; }
    public string Type { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Value { get; set; } = null!;
    public int TTL { get; set; }
    
    public DomainRecord Domain { get; set; } = null!;
}
