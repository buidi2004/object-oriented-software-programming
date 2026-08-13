using System;
using System.Collections.Generic;
using CloudServiceStore.Application.Caching;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlansWithCurrency;

public class GetServicePlansWithCurrencyQuery : IRequest<IReadOnlyList<ServicePlanPriceDto>>, ICacheableQuery
{
    public string Currency { get; set; } = "VND";

    public string CacheKey => CatalogCacheKeys.AllPlanPrices(Currency);
    public TimeSpan CacheDuration => CatalogCacheKeys.AllPlanPricesTtl;
}
