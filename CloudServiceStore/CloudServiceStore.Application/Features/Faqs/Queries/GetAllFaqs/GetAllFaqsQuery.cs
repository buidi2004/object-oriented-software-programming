using System;
using System.Collections.Generic;
using CloudServiceStore.Application.Caching;
using CloudServiceStore.Application.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Faqs.Queries.GetAllFaqs;

public record GetAllFaqsQuery() : IRequest<IEnumerable<FaqDto>>, ICacheableQuery
{
    public string CacheKey => CatalogCacheKeys.Faqs;
    public TimeSpan CacheDuration => CatalogCacheKeys.FaqsTtl;
}
