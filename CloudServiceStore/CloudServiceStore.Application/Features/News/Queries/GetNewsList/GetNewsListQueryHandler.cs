using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.News.Queries.GetNewsList;

public class GetNewsListQueryHandler : IRequestHandler<GetNewsListQuery, IReadOnlyList<NewsArticleDto>>
{
    private readonly IRepository<NewsArticle> _repo;

    public GetNewsListQueryHandler(IRepository<NewsArticle> repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<NewsArticleDto>> Handle(GetNewsListQuery request, CancellationToken ct)
    {
        var articles = request.OnlyPublished
            ? await _repo.WhereAsync(a => a.Status == Domain.Enums.ArticleStatus.Published, ct)
            : await _repo.GetAllAsync(ct);

        return articles.Select(a => new NewsArticleDto(
            a.Id, a.Title, a.Slug, a.Status.ToString(), a.AuthorId
        )).ToList().AsReadOnly();
    }
}
