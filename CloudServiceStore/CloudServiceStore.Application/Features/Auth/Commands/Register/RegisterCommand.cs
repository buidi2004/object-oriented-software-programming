using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string FullName, 
    string Email, 
    string Password, 
    string? PhoneNumber,
    string? FirstName = null,
    string? LastName = null,
    string? Country = null,
    string? City = null,
    string? Ward = null,
    string? AddressLine = null,
    string? CompanyName = null,
    string? TaxCode = null,
    bool SubscribeNewsletter = false)
    : IRequest<RegisterResult>;

public record RegisterResult(Guid UserId, string Email);
