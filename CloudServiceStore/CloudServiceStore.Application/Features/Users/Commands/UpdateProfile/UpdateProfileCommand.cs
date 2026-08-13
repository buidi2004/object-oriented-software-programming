using MediatR;

namespace CloudServiceStore.Application.Features.Users.Commands.UpdateProfile;

public record UpdateProfileCommand(
    string FullName,
    string? PhoneNumber,
    string? FirstName,
    string? LastName,
    string? Country,
    string? City,
    string? Ward,
    string? AddressLine,
    string? CompanyName,
    string? TaxCode
) : IRequest<Unit>;
