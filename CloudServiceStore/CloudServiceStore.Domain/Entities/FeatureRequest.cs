using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class FeatureRequest : AggregateRoot
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = "General";
    public int UpvoteCount { get; set; }
    public string Status { get; set; } = "UnderReview";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
