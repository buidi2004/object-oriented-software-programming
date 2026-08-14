using System;
using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class Permission : AggregateRoot
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
