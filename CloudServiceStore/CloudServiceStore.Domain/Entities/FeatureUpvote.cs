using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class FeatureUpvote : AggregateRoot
{
    public Guid FeatureRequestId { get; set; }
    public Guid UserId { get; set; }
}
