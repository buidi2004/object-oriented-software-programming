using System;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.SEO.Queries.GetSitemap;

public class GetSitemapQueryHandler : IRequestHandler<GetSitemapQuery, string>
{
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<KnowledgeBaseArticle> _kbRepo;

    public GetSitemapQueryHandler(IRepository<ServicePlan> planRepo, IRepository<KnowledgeBaseArticle> kbRepo)
    {
        _planRepo = planRepo;
        _kbRepo = kbRepo;
    }

    public async Task<string> Handle(GetSitemapQuery request, CancellationToken ct)
    {
        var sb = new StringBuilder();
        sb.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.AppendLine("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

        // Static routes
        sb.AppendLine(BuildUrlNode(request.BaseUrl, "/", "1.0", "daily"));
        sb.AppendLine(BuildUrlNode(request.BaseUrl, "/services", "0.8", "weekly"));
        sb.AppendLine(BuildUrlNode(request.BaseUrl, "/kb", "0.8", "weekly"));

        // Dynamic Service Plans
        var plans = await _planRepo.WhereAsync(p => p.IsActive, ct);
        foreach (var p in plans)
        {
            sb.AppendLine(BuildUrlNode(request.BaseUrl, $"/services/{p.Id}", "0.9", "weekly"));
        }

        // Dynamic KB Articles
        var kbs = await _kbRepo.WhereAsync(k => k.IsPublished, ct);
        foreach (var k in kbs)
        {
            sb.AppendLine(BuildUrlNode(request.BaseUrl, $"/kb/{k.Slug}", "0.7", "monthly"));
        }

        sb.AppendLine("</urlset>");
        return sb.ToString();
    }

    private string BuildUrlNode(string baseUrl, string path, string priority, string changeFreq)
    {
        var url = $"{baseUrl.TrimEnd('/')}{path}";
        return $@"  <url>
    <loc>{url}</loc>
    <lastmod>{DateTime.UtcNow:yyyy-MM-dd}</lastmod>
    <changefreq>{changeFreq}</changefreq>
    <priority>{priority}</priority>
  </url>";
    }
}
