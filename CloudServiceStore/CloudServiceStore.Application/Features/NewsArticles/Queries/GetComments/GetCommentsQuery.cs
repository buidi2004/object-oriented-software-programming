using MediatR;
using System;
using System.Collections.Generic;

namespace CloudServiceStore.Application.Features.NewsArticles.Queries.GetComments;

public class GetCommentsQuery : IRequest<IEnumerable<ArticleCommentDto>>
{
    public Guid NewsArticleId { get; set; }

    public GetCommentsQuery(Guid newsArticleId)
    {
        NewsArticleId = newsArticleId;
    }
}

public class ArticleCommentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public bool IsApproved { get; set; }
}
