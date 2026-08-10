using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class NewsArticle : AggregateRoot
{
    public string Title { get; private set; } = null!;
    public string Slug { get; private set; } = null!;
    public string Content { get; private set; } = null!;
    public string? ThumbnailUrl { get; private set; }
    public string? Tags { get; private set; }
    public int ViewCount { get; private set; }
    public Guid AuthorId { get; private set; }
    public ArticleStatus Status { get; private set; }
    public DateTime? PublishedAt { get; private set; }
    
    public AppUser Author { get; private set; } = null!;

    private NewsArticle() { } // EF Core

    public NewsArticle(string title, string slug, string content, Guid authorId, string? thumbnailUrl = null, string? tags = null, ArticleStatus status = ArticleStatus.Draft)
    {
        Id = Guid.NewGuid();
        Title = title;
        Slug = slug;
        Content = content;
        AuthorId = authorId;
        ThumbnailUrl = thumbnailUrl;
        Tags = tags;
        Status = status;
        ViewCount = 0;

        if (status == ArticleStatus.Published)
        {
            PublishedAt = DateTime.UtcNow;
        }
    }

    public void Update(string title, string slug, string content, string? thumbnailUrl, string? tags, ArticleStatus status)
    {
        Title = title;
        Slug = slug;
        Content = content;
        ThumbnailUrl = thumbnailUrl;
        Tags = tags;
        
        if (Status != ArticleStatus.Published && status == ArticleStatus.Published)
        {
            PublishedAt = DateTime.UtcNow;
        }

        Status = status;
    }

    public void IncrementViewCount()
    {
        ViewCount++;
    }
}
