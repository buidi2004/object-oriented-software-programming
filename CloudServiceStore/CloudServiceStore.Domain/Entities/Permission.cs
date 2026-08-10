using CloudServiceStore.Domain.Primitives;
using System;
using System.Collections.Generic;

namespace CloudServiceStore.Domain.Entities;

public class Permission : AggregateRoot
{
    public string Code { get; internal set; } = null!;
    public string Description { get; internal set; } = null!;

    public ICollection<RolePermission> RolePermissions { get; internal set; } = new List<RolePermission>();

    internal Permission() { }

    public Permission(string code, string description)
    {
        Id = Guid.NewGuid();
        Code = code;
        Description = description;
    }
}
