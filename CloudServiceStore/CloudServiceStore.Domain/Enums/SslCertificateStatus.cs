namespace CloudServiceStore.Domain.Enums;

public enum SslCertificateStatus : long
{
    Pending = 0,
    Issued = 1,
    Expired = 2,
    Failed = 3
}
