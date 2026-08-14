using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CloudServiceStore.Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace CloudServiceStore.WebApi.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? UserId
    {
        get
        {
            var user = _httpContextAccessor.HttpContext?.User;
            if (user == null) return null;

            var idClaim = user.FindFirst(ClaimTypes.NameIdentifier)
                ?? user.FindFirst(JwtRegisteredClaimNames.Sub)
                ?? user.FindFirst("sub");

            if (idClaim != null && Guid.TryParse(idClaim.Value, out var id))
            {
                return id;
            }
            return null;
        }
    }

    public string? IpAddress => _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

    public bool IsInRole(string role) =>
        _httpContextAccessor.HttpContext?.User?.IsInRole(role) ?? false;
}
