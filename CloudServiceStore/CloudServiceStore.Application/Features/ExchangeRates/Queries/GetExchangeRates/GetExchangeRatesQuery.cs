using System;
using System.Collections.Generic;
using CloudServiceStore.Application.Caching;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ExchangeRates.Queries.GetExchangeRates;

public class GetExchangeRatesQuery : IRequest<IReadOnlyList<ExchangeRateDto>>, ICacheableQuery
{
    public string CacheKey => CatalogCacheKeys.ExchangeRates;
    public TimeSpan CacheDuration => CatalogCacheKeys.ExchangeRatesTtl;
}
