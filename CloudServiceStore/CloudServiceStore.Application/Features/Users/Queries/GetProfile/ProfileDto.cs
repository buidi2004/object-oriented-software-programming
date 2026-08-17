using System;

namespace CloudServiceStore.Application.Features.Users.Queries.GetProfile;

public record ProfileDto(
    Guid Id,
    string FullName,
    string Email,
    string? PhoneNumber,
    string? FirstName,
    string? LastName,
    string? Country,
    string? City,
    string? Ward,
    string? AddressLine,
    string? CompanyName,
    string? TaxCode,
    DateTime CreatedAt,
    string Role = "Customer"
);
