using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.NewsArticles.Queries.GetComments;

public class GetCommentsQueryHandler : IRequestHandler<GetCommentsQuery, IEnumerable<ArticleCommentDto>>
{
    private readonly IRepository<ArticleComment> _repository;

    public GetCommentsQueryHandler(IRepository<ArticleComment> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ArticleCommentDto>> Handle(GetCommentsQuery request, CancellationToken cancellationToken)
    {
        var comments = await _repository.WhereAsync(c => c.NewsArticleId == request.NewsArticleId && c.IsApproved, cancellationToken);
        
        return comments.Select(c => new ArticleCommentDto
        {
            Id = c.Id,
            UserId = c.UserId,
            Content = c.Content,
            CreatedAt = c.CreatedAt,
            IsApproved = c.IsApproved
        }).OrderByDescending(c => c.CreatedAt).ToList();
    }
}
