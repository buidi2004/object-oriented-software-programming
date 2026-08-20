using CloudServiceStore.Domain.Primitives;
using CloudServiceStore.Domain.Enums;
using System;

namespace CloudServiceStore.Domain.Entities;

public class SslCertificate : AggregateRoot
{
    public Guid DomainId { get; set; }
    public string Csr { get; set; } = null!;
    public string? Certificate { get; private set; }
    public string? PrivateKey { get; private set; }
    public DateTime? ExpiryDate { get; private set; }
    
    // Idempotency & State Machine
    public string IdempotencyKey { get; set; } = "";
    public SslCertificateStatus Status { get; private set; } = SslCertificateStatus.Pending;
    public string FailureReason { get; private set; } = "";
    
    public DomainRecord Domain { get; set; } = null!;

    // State Machine Methods
    public void MarkAsIssued(string certificate, string privateKey, DateTime expiryDate)
    {
        if (Status != SslCertificateStatus.Pending && Status != SslCertificateStatus.Expired)
        {
            throw new InvalidOperationException($"Không thể cấp phát chứng chỉ từ trạng thái {Status}");
        }

        Certificate = certificate;
        PrivateKey = privateKey;
        ExpiryDate = expiryDate;
        Status = SslCertificateStatus.Issued;
    }

    public void MarkAsFailed(string reason)
    {
        FailureReason = reason;
        Status = SslCertificateStatus.Failed;
    }

    public void MarkAsExpired()
    {
        if (Status != SslCertificateStatus.Issued)
        {
            throw new InvalidOperationException("Chỉ có chứng chỉ đã cấp mới có thể hết hạn");
        }
        Status = SslCertificateStatus.Expired;
    }
}
