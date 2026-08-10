using MediatR;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.Search.Queries.GlobalSearch;

public class GlobalSearchQuery : IRequest<GlobalSearchResultDto>
{
    public string Keyword { get; set; } = null!;

    public GlobalSearchQuery(string keyword)
    {
        Keyword = keyword;
    }
}

public class GlobalSearchResultDto
{
    public List<SearchItemDto> ServicePlans { get; set; } = new();
    public List<SearchItemDto> NewsArticles { get; set; } = new();
    public List<SearchItemDto> Faqs { get; set; } = new();
    public List<SearchItemDto> KnowledgeBase { get; set; } = new();
}

public class SearchItemDto
{
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Summary { get; set; } = null!;
}
