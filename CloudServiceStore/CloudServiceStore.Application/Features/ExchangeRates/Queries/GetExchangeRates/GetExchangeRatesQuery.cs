using System.Collections.Generic;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.ExchangeRates.Queries.GetExchangeRates;

public class GetExchangeRatesQuery : IRequest<IReadOnlyList<ExchangeRateDto>> { }
