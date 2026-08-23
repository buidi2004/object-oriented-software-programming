using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Users.Queries.GetUsers;

public record UserDto(
    Guid Id, 
    string Email, 
    string FullName, 
    bool IsActive,
    string Role,
    string? PhoneNumber,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);

public record GetUsersQuery() : IRequest<IReadOnlyList<UserDto>>;
