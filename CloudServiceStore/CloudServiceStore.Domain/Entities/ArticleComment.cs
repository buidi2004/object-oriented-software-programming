using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class ArticleComment : AggregateRoot
{
    public Guid ArticleId { get; set; }
    public Guid UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public NewsArticle Article { get; set; } = null!;
    public AppUser User { get; set; } = null!;
}
