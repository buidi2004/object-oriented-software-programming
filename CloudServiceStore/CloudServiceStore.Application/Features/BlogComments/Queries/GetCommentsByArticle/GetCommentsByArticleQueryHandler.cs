using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.BlogComments.Queries.GetCommentsByArticle;

public class GetCommentsByArticleQueryHandler : IRequestHandler<GetCommentsByArticleQuery, IReadOnlyList<CommentDto>>
{
    private readonly IRepository<ArticleComment> _repo;

    public GetCommentsByArticleQueryHandler(IRepository<ArticleComment> repo)
    {
        _repo = repo;
    }

    public async Task<IReadOnlyList<CommentDto>> Handle(GetCommentsByArticleQuery request, CancellationToken ct)
    {
        var comments = await _repo.WhereAsync(c => c.NewsArticleId == request.ArticleId, ct);

        return comments.OrderByDescending(c => c.CreatedAt)
            .Select(c => new CommentDto(c.Id, c.UserId, c.Content, c.CreatedAt))
            .ToList().AsReadOnly();
    }
}
