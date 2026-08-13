using System;

namespace CloudServiceStore.Application.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? IpAddress { get; }
    bool IsInRole(string role);
}
