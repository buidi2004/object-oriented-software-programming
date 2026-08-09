using System;
using System.Security.Cryptography;
using System.Text;

namespace CloudServiceStore.Application.Security;

public static class RefreshTokenHasher
{
    public static string Hash(string refreshToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(refreshToken));
        return Convert.ToHexString(bytes);
    }
}
