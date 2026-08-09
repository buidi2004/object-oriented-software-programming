using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class Role : AggregateRoot
{
    public string Name { get; set; } = null!;
}
