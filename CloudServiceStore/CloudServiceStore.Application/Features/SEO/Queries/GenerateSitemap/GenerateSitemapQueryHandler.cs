using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.SEO.Queries.GenerateSitemap;

public class GenerateSitemapQueryHandler : IRequestHandler<GenerateSitemapQuery, string>
{
    private readonly IRepository<ServicePlan> _servicePlanRepository;
    private readonly IRepository<NewsArticle> _newsRepository;

    public GenerateSitemapQueryHandler(IRepository<ServicePlan> servicePlanRepository, IRepository<NewsArticle> newsRepository)
    {
        _servicePlanRepository = servicePlanRepository;
        _newsRepository = newsRepository;
    }

    public async Task<string> Handle(GenerateSitemapQuery request, CancellationToken cancellationToken)
    {
        var plans = await _servicePlanRepository.WhereAsync(p => p.IsActive, cancellationToken);
        var news = await _newsRepository.WhereAsync(n => n.Status == ArticleStatus.Published, cancellationToken);
        
        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
        
        foreach (var plan in plans)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>https://example.com/service-plans/{plan.Id}</loc>");
            sb.AppendLine("    <changefreq>weekly</changefreq>");
            sb.AppendLine("    <priority>0.8</priority>");
            sb.AppendLine("  </url>");
        }

        foreach (var article in news)
        {
            sb.AppendLine("  <url>");
            sb.AppendLine($"    <loc>https://example.com/news/{article.Slug}</loc>");
            sb.AppendLine("    <changefreq>monthly</changefreq>");
            sb.AppendLine("    <priority>0.6</priority>");
            sb.AppendLine("  </url>");
        }

        sb.AppendLine("</urlset>");
        return sb.ToString();
    }
}
