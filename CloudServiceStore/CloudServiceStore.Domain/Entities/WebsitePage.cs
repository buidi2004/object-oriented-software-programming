using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Primitives;
using System;
using System.Collections.Generic;

namespace CloudServiceStore.Domain.Entities;

public class WebsiteBuilderProject : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = null!;
    public string TemplateId { get; set; } = string.Empty;
    public WebsiteProjectStatus Status { get; private set; } = WebsiteProjectStatus.Draft;
    public string IdempotencyKey { get; set; } = string.Empty;
    public string LiveUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PublishedAt { get; set; }
    public string FailureReason { get; private set; } = string.Empty;
    public ICollection<WebsitePage> Pages { get; set; } = new List<WebsitePage>();

    public void MarkAsPublishing()
    {
        if (Status != WebsiteProjectStatus.Draft && Status != WebsiteProjectStatus.Failed)
            throw new InvalidOperationException($"Không thể chuyển sang Publishing từ trạng thái {Status}");
        Status = WebsiteProjectStatus.Publishing;
    }

    public void MarkAsPublished(string liveUrl)
    {
        if (Status != WebsiteProjectStatus.Publishing)
            throw new InvalidOperationException($"Không thể chuyển sang Published từ trạng thái {Status}");
        Status = WebsiteProjectStatus.Published;
        LiveUrl = liveUrl;
        PublishedAt = DateTime.UtcNow;
    }

    public void MarkAsFailed(string reason)
    {
        Status = WebsiteProjectStatus.Failed;
        FailureReason = reason;
    }
}

public class WebsitePage : Entity
{
    public Guid ProjectId { get; set; }
    public string PageName { get; set; } = null!;
    public string ContentJson { get; set; } = "{}";
    public int Order { get; set; }
}
