using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Queries.GetNewsBySlug;

public class GetNewsBySlugQueryHandler : IRequestHandler<GetNewsBySlugQuery, NewsArticleDetailDto>
{
    private readonly IRepository<NewsArticle> _repo;

    public GetNewsBySlugQueryHandler(IRepository<NewsArticle> repo)
    {
        _repo = repo;
    }

    public async Task<NewsArticleDetailDto> Handle(GetNewsBySlugQuery request, CancellationToken ct)
    {
        var article = await _repo.FirstOrDefaultAsync(a => a.Slug == request.Slug, ct)
            ?? throw new NotFoundException($"Không tìm thấy bài viết với slug: {request.Slug}");

        return new NewsArticleDetailDto(
            article.Id, article.Title, article.Slug, article.Content, article.Status.ToString(), article.AuthorId
        );
    }
}
