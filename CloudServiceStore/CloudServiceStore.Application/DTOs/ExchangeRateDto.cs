using System;

namespace CloudServiceStore.Application.DTOs;

public class ExchangeRateDto
{
    public Guid Id { get; set; }
    public string FromCurrency { get; set; } = null!;
    public string ToCurrency { get; set; } = null!;
    public decimal Rate { get; set; }
    public DateTime UpdatedAt { get; set; }
}
