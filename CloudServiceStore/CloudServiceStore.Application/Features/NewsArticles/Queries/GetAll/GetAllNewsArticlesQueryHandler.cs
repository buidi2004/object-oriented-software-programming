using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.NewsArticles.Queries.GetById;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.NewsArticles.Queries.GetAll;

public class GetAllNewsArticlesQueryHandler : IRequestHandler<GetAllNewsArticlesQuery, IEnumerable<NewsArticleDto>>
{
    private readonly IRepository<NewsArticle> _newsRepository;

    public GetAllNewsArticlesQueryHandler(IRepository<NewsArticle> newsRepository)
    {
        _newsRepository = newsRepository;
    }

    public async Task<IEnumerable<NewsArticleDto>> Handle(GetAllNewsArticlesQuery request, CancellationToken cancellationToken)
    {
        var articles = await _newsRepository.GetAllAsync();
        
        return articles.Select(a => new NewsArticleDto(
            a.Id,
            a.Title,
            a.Slug,
            a.Content,
            a.ThumbnailUrl,
            a.Tags,
            a.ViewCount,
            a.Status,
            a.PublishedAt,
            a.AuthorId
        ));
    }
}
