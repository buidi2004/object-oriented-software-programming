using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class RolePermission : AggregateRoot
{
    public Guid RoleId { get; internal set; }
    public Guid PermissionId { get; internal set; }

    public Role Role { get; internal set; } = null!;
    public Permission Permission { get; internal set; } = null!;

    internal RolePermission() { }

    public RolePermission(Guid roleId, Guid permissionId)
    {
        Id = Guid.NewGuid();
        RoleId = roleId;
        PermissionId = permissionId;
    }
}
