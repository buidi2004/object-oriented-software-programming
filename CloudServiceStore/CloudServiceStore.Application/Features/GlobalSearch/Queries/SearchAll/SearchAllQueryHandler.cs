using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.GlobalSearch.Queries.SearchAll;

public class SearchAllQueryHandler : IRequestHandler<SearchAllQuery, IReadOnlyList<SearchResultItem>>
{
    private readonly IRepository<ServicePlan> _planRepo;
    private readonly IRepository<KnowledgeBaseArticle> _kbRepo;

    public SearchAllQueryHandler(IRepository<ServicePlan> planRepo, IRepository<KnowledgeBaseArticle> kbRepo)
    {
        _planRepo = planRepo;
        _kbRepo = kbRepo;
    }

    public async Task<IReadOnlyList<SearchResultItem>> Handle(SearchAllQuery request, CancellationToken ct)
    {
        var results = new List<SearchResultItem>();
        
        if (string.IsNullOrWhiteSpace(request.Keyword))
            return results;

        var kw = request.Keyword.ToLower();

        // Search Service Plans
        var plans = await _planRepo.WhereAsync(p => p.Name.ToLower().Contains(kw) || (p.Cpu != null && p.Cpu.ToLower().Contains(kw)), ct);
        results.AddRange(plans.Select(p => new SearchResultItem(p.Id, "ServicePlan", p.Name, p.Cpu ?? "")));

        // Search KB Articles
        var kbs = await _kbRepo.WhereAsync(k => k.Title.ToLower().Contains(kw) || k.Content.ToLower().Contains(kw), ct);
        results.AddRange(kbs.Select(k => new SearchResultItem(
            k.Id, "Article", k.Title,
            k.Content.Substring(0, System.Math.Min(k.Content.Length, 100)),
            k.Slug)));

        return results.OrderBy(r => r.Title).ToList().AsReadOnly();
    }
}
