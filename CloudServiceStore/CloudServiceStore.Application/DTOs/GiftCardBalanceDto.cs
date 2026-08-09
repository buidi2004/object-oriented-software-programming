namespace CloudServiceStore.Application.DTOs;

public class GiftCardBalanceDto
{
    public string Code { get; set; } = null!;
    public decimal RemainingAmount { get; set; }
    public bool IsActive { get; set; }
}
