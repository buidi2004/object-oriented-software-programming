namespace CloudServiceStore.Application.Features.Renewals.DTOs;

public class RenewalEventDto
{
    public string ServiceType { get; set; } = string.Empty; // "VPS", "Domain", "SSL"
    public string ServiceName { get; set; } = string.Empty;
    public DateTime ExpiryDate { get; set; }
    public decimal EstimatedRenewalCost { get; set; }
    public bool AutoRenewActive { get; set; }
}