using System;
using System.Collections.Generic;
using CloudServiceStore.Application.Caching;
using CloudServiceStore.Application.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Queries.GetCategories;

public record GetCategoriesQuery : IRequest<List<CategoryDto>>, ICacheableQuery
{
    public string CacheKey => CatalogCacheKeys.Categories;
    public TimeSpan CacheDuration => CatalogCacheKeys.CategoriesTtl;
}

public record CategoryDto(Guid Id, string Name, string Slug);
