using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetPublishedKbArticles;

public class GetPublishedKbArticlesQueryHandler : IRequestHandler<GetPublishedKbArticlesQuery, IReadOnlyList<KbArticleSummaryDto>>
{
    private readonly IRepository<KnowledgeBaseArticle> _kbRepository;

    public GetPublishedKbArticlesQueryHandler(IRepository<KnowledgeBaseArticle> kbRepository)
    {
        _kbRepository = kbRepository;
    }

    public async Task<IReadOnlyList<KbArticleSummaryDto>> Handle(GetPublishedKbArticlesQuery request, CancellationToken cancellationToken)
    {
        var articles = await _kbRepository.GetAllAsync(cancellationToken);

        return articles
            .Where(a => a.IsPublished)
            .OrderBy(a => a.Title)
            .Select(a => new KbArticleSummaryDto(a.Id, a.Title, a.Slug, a.CategoryTag, a.ViewCount))
            .ToList()
            .AsReadOnly();
    }
}
