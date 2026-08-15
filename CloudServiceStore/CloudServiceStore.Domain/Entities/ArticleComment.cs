using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class ArticleComment : AggregateRoot
{
    public Guid NewsArticleId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsApproved { get; set; }

    public ArticleComment() { }

    public ArticleComment(Guid newsArticleId, Guid userId, string content)
    {
        Id = Guid.NewGuid();
        NewsArticleId = newsArticleId;
        UserId = userId;
        Content = content;
        CreatedAt = DateTime.UtcNow;
        IsApproved = false;
    }

    public void Approve()
    {
        IsApproved = true;
    }

    // Navigation properties
    public NewsArticle Article { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
