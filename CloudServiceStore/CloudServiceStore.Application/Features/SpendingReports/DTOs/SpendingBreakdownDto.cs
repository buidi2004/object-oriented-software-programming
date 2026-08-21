namespace CloudServiceStore.Application.Features.SpendingReports.DTOs;

public class SpendingBreakdownDto
{
    public string Category { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Color { get; set; } = "#3b82f6";
}

public class MonthlySpendingDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal TotalAmount { get; set; }
    public List<SpendingBreakdownDto> Breakdown { get; set; } = new();
}
