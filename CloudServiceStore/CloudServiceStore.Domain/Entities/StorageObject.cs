using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class StorageObject : AggregateRoot
{
    public Guid BucketId { get; set; }
    public string Key { get; set; } = null!;
    public long SizeBytes { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public StorageBucket? Bucket { get; set; }
}
