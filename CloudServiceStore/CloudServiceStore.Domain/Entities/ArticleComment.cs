using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class ArticleComment : AggregateRoot
{
    public Guid NewsArticleId { get; internal set; }
    public Guid UserId { get; internal set; }
    public string Content { get; internal set; } = null!;
    public bool IsApproved { get; internal set; }
    public DateTime CreatedAt { get; internal set; }

    public NewsArticle Article { get; internal set; } = null!;
    public AppUser User { get; internal set; } = null!;

    internal ArticleComment() { }

    public ArticleComment(Guid newsArticleId, Guid userId, string content)
    {
        Id = Guid.NewGuid();
        NewsArticleId = newsArticleId;
        UserId = userId;
        Content = content;
        IsApproved = false; // default
        CreatedAt = DateTime.UtcNow;
    }

    public void Approve()
    {
        IsApproved = true;
    }
}
