using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class AppUser : AggregateRoot
{
    public string FullName { get; internal set; } = null!;
    public string? FirstName { get; internal set; }
    public string? LastName { get; internal set; }
    public string Email { get; internal set; } = null!;
    public string PasswordHash { get; internal set; } = null!;
    public string? PhoneNumber { get; internal set; }
    public string? Country { get; internal set; }
    public string? City { get; internal set; }
    public string? Ward { get; internal set; }
    public string? AddressLine { get; internal set; }
    public string? CompanyName { get; internal set; }
    public string? TaxCode { get; internal set; }
    public Guid RoleId { get; internal set; }
    public bool IsActive { get; internal set; }
    public DateTime CreatedAt { get; internal set; }
    public string? AvatarUrl { get; internal set; }
    
    public bool IsTwoFactorEnabled { get; private set; } = false;
    public string? TwoFactorSecretKey { get; private set; }

    public Role Role { get; internal set; } = null!;

    internal AppUser() { }

    public AppUser(string fullName, string email, string passwordHash, Guid roleId, string? phoneNumber = null, 
        string? firstName = null, string? lastName = null, string? country = null, string? city = null, 
        string? ward = null, string? addressLine = null, string? companyName = null, string? taxCode = null)
    {
        Id = Guid.NewGuid();
        FullName = fullName;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
        PasswordHash = passwordHash;
        RoleId = roleId;
        PhoneNumber = phoneNumber;
        Country = country;
        City = city;
        Ward = ward;
        AddressLine = addressLine;
        CompanyName = companyName;
        TaxCode = taxCode;
        IsActive = true;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateProfile(string fullName, string? phoneNumber, string? firstName, string? lastName, 
        string? country, string? city, string? ward, string? addressLine, string? companyName, string? taxCode)
    {
        FullName = fullName;
        PhoneNumber = phoneNumber;
        FirstName = firstName;
        LastName = lastName;
        Country = country;
        City = city;
        Ward = ward;
        AddressLine = addressLine;
        CompanyName = companyName;
        TaxCode = taxCode;
    }

    public void UpdateBasicInfo(string fullName, string email, string? phoneNumber)
    {
        FullName = fullName;
        Email = email;
        PhoneNumber = phoneNumber;
    }

    public void ChangePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
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

    public void UpdateAvatarUrl(string avatarUrl)
    {
        AvatarUrl = avatarUrl;
    }

    public void EnableTwoFactor(string secretKey)
    {
        TwoFactorSecretKey = secretKey;
        IsTwoFactorEnabled = true;
    }

    public void DisableTwoFactor()
    {
        TwoFactorSecretKey = null;
        IsTwoFactorEnabled = false;
    }
}
