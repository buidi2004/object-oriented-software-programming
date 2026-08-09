using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Interfaces;

public interface ITokenGenerator
{
    string GenerateAccessToken(AppUser user, string roleName);
    string GenerateRefreshToken();
}
