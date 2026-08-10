using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.NewsArticles.Queries.GetById;

public class GetNewsArticleByIdQueryHandler : IRequestHandler<GetNewsArticleByIdQuery, NewsArticleDto?>
{
    private readonly IRepository<NewsArticle> _newsRepository;

    public GetNewsArticleByIdQueryHandler(IRepository<NewsArticle> newsRepository)
    {
        _newsRepository = newsRepository;
    }

    public async Task<NewsArticleDto?> Handle(GetNewsArticleByIdQuery request, CancellationToken cancellationToken)
    {
        var article = await _newsRepository.GetByIdAsync(request.Id);

        if (article == null)
            return null;

        return new NewsArticleDto(
            article.Id,
            article.Title,
            article.Slug,
            article.Content,
            article.ThumbnailUrl,
            article.Tags,
            article.ViewCount,
            article.Status,
            article.PublishedAt,
            article.AuthorId
        );
    }
}
