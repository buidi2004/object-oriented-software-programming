using System;

namespace CloudServiceStore.Domain.Entities;

public class ExchangeRate
{
    public Guid Id { get; set; }
    public string FromCurrency { get; set; } = null!; // e.g. "USD"
    public string ToCurrency { get; set; } = null!;   // e.g. "VND"
    public decimal Rate { get; set; }                  // e.g. 25000 (1 USD = 25000 VND)
    public DateTime UpdatedAt { get; set; }
}
