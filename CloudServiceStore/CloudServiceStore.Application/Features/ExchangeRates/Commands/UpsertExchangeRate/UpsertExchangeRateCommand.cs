using MediatR;

namespace CloudServiceStore.Application.Features.ExchangeRates.Commands.UpsertExchangeRate;

public class UpsertExchangeRateCommand : IRequest<bool>
{
    public string FromCurrency { get; set; } = null!;
    public string ToCurrency { get; set; } = null!;
    public decimal Rate { get; set; }
}
