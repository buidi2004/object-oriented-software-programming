using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class AppUser : AggregateRoot
{
    public string FullName { get; internal set; } = null!;
    public string Email { get; internal set; } = null!;
    public string PasswordHash { get; internal set; } = null!;
    public string? PhoneNumber { get; internal set; }
    public Guid RoleId { get; internal set; }
    public bool IsActive { get; internal set; }
    public DateTime CreatedAt { get; internal set; }
    
    public Role Role { get; internal set; } = null!;

    internal AppUser() { }

    public AppUser(string fullName, string email, string passwordHash, Guid roleId, string? phoneNumber = null)
    {
        Id = Guid.NewGuid();
        FullName = fullName;
        Email = email;
        PasswordHash = passwordHash;
        RoleId = roleId;
        PhoneNumber = phoneNumber;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(string fullName, string? phoneNumber)
    {
        FullName = fullName;
        PhoneNumber = phoneNumber;
    }

    public void ChangeRole(Guid newRoleId)
    {
        RoleId = newRoleId;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void Activate()
    {
        IsActive = true;
    }
}
