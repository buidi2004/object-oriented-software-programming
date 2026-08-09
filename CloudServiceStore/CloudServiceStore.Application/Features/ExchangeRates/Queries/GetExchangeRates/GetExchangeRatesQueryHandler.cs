using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ExchangeRates.Queries.GetExchangeRates;

public class GetExchangeRatesQueryHandler : IRequestHandler<GetExchangeRatesQuery, IReadOnlyList<ExchangeRateDto>>
{
    private readonly IRepository<ExchangeRate> _rateRepo;

    public GetExchangeRatesQueryHandler(IRepository<ExchangeRate> rateRepo)
    {
        _rateRepo = rateRepo;
    }

    public async Task<IReadOnlyList<ExchangeRateDto>> Handle(GetExchangeRatesQuery request, CancellationToken cancellationToken)
    {
        var rates = await _rateRepo.GetAllAsync(cancellationToken);
        return rates.Select(r => new ExchangeRateDto
        {
            Id = r.Id,
            FromCurrency = r.FromCurrency,
            ToCurrency = r.ToCurrency,
            Rate = r.Rate,
            UpdatedAt = r.UpdatedAt
        }).ToList();
    }
}
