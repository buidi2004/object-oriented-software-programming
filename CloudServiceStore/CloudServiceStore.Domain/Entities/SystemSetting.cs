using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class SystemSetting : AggregateRoot
{
    public string Key { get; internal set; } = null!;
    public string Value { get; internal set; } = null!;
    public DateTime UpdatedAt { get; internal set; }

    internal SystemSetting() { }

    public SystemSetting(string key, string value)
    {
        Id = Guid.NewGuid();
        Key = key;
        Value = value;
        UpdatedAt = DateTime.UtcNow;
    }

    public void UpdateValue(string value)
    {
        Value = value;
        UpdatedAt = DateTime.UtcNow;
    }
}
