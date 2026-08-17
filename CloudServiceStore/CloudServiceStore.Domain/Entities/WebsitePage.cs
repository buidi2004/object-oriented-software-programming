using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class WebsiteBuilderProject : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public string TemplateId { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public string LiveUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
    public ICollection<WebsitePage> Pages { get; set; } = new List<WebsitePage>();
}

public class WebsitePage : Entity
{
    public Guid ProjectId { get; set; }
    public string PageName { get; set; } = null!;
    public string ContentJson { get; set; } = "{}";
    public int Order { get; set; }
}
