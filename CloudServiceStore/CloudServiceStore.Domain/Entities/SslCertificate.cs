using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class SslCertificate : AggregateRoot
{
    public Guid DomainId { get; set; }
    public string Csr { get; set; } = null!;
    public string? Certificate { get; set; }
    public string? PrivateKey { get; set; }
    public DateTime? ExpiryDate { get; set; }
    
    public DomainRecord Domain { get; set; } = null!;
}
