using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class KnowledgeBaseArticle : AggregateRoot
{
    public string Title { get; private set; }
    public string Slug { get; private set; }
    public string Content { get; private set; }
    public string CategoryTag { get; private set; }
    public bool IsPublished { get; private set; }
    public int ViewCount { get; private set; }
    public Guid AuthorId { get; private set; }
    
    public AppUser Author { get; private set; } = null!;

    private KnowledgeBaseArticle() { } // EF Core

    public KnowledgeBaseArticle(string title, string slug, string content, string categoryTag, Guid authorId, bool isPublished = false)
    {
        Id = Guid.NewGuid();
        Title = title;
        Slug = slug;
        Content = content;
        CategoryTag = categoryTag;
        AuthorId = authorId;
        IsPublished = isPublished;
        ViewCount = 0;
    }

    public void Update(string title, string slug, string content, string categoryTag, bool isPublished)
    {
        Title = title;
        Slug = slug;
        Content = content;
        CategoryTag = categoryTag;
        IsPublished = isPublished;
    }

    public void IncrementViewCount()
    {
        ViewCount++;
    }
}
