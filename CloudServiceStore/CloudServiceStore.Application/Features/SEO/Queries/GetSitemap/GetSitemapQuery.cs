using MediatR;

namespace CloudServiceStore.Application.Features.SEO.Queries.GetSitemap;

public record GetSitemapQuery(string BaseUrl) : IRequest<string>;
