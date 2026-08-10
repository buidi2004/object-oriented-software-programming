using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Search.Queries.GlobalSearch;

public class GlobalSearchQueryHandler : IRequestHandler<GlobalSearchQuery, GlobalSearchResultDto>
{
    private readonly IRepository<ServicePlan> _servicePlanRepository;
    private readonly IRepository<NewsArticle> _newsRepository;
    private readonly IRepository<FaqItem> _faqRepository;
    private readonly IRepository<KnowledgeBaseArticle> _kbRepository;

    public GlobalSearchQueryHandler(
        IRepository<ServicePlan> servicePlanRepository,
        IRepository<NewsArticle> newsRepository,
        IRepository<FaqItem> faqRepository,
        IRepository<KnowledgeBaseArticle> kbRepository)
    {
        _servicePlanRepository = servicePlanRepository;
        _newsRepository = newsRepository;
        _faqRepository = faqRepository;
        _kbRepository = kbRepository;
    }

    public async Task<GlobalSearchResultDto> Handle(GlobalSearchQuery request, CancellationToken cancellationToken)
    {
        var kw = request.Keyword.ToLower();
        
        var plans = await _servicePlanRepository.WhereAsync(p => p.Name.ToLower().Contains(kw), cancellationToken);
        var news = await _newsRepository.WhereAsync(n => n.Title.ToLower().Contains(kw) || n.Content.ToLower().Contains(kw), cancellationToken);
        var faqs = await _faqRepository.WhereAsync(f => f.Question.ToLower().Contains(kw) || f.Answer.ToLower().Contains(kw), cancellationToken);
        var kbs = await _kbRepository.WhereAsync(k => k.Title.ToLower().Contains(kw) || k.Content.ToLower().Contains(kw), cancellationToken);

        var result = new GlobalSearchResultDto();

        result.ServicePlans = plans.Select(p => new SearchItemDto { Id = p.Id.ToString(), Title = p.Name, Summary = "Service Plan" }).ToList();
        result.NewsArticles = news.Select(n => new SearchItemDto { Id = n.Id.ToString(), Title = n.Title, Summary = "News Article" }).ToList();
        result.Faqs = faqs.Select(f => new SearchItemDto { Id = f.Id.ToString(), Title = f.Question, Summary = "FAQ" }).ToList();
        result.KnowledgeBase = kbs.Select(k => new SearchItemDto { Id = k.Id.ToString(), Title = k.Title, Summary = "Knowledge Base" }).ToList();

        return result;
    }
}
