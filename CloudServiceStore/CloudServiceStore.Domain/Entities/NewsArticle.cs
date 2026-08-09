using CloudServiceStore.Domain.Primitives;
using System;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Domain.Entities;

public class NewsArticle : AggregateRoot
{
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string Content { get; set; } = null!;
    public Guid AuthorId { get; set; }
    public ArticleStatus Status { get; set; }
    
    public AppUser Author { get; set; } = null!;
}
