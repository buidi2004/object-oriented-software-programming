using System;
using System.Security.Cryptography;
using System.Text;

namespace CloudServiceStore.Application.Features.Auth.Commands.TwoFactor;

public static class TwoFactorBackupCodeHelper
{
    private static readonly char[] Chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".ToCharArray();

    public static string GenerateCode()
    {
        var raw = RandomNumberGenerator.GetString(Chars, 8);
        return $"{raw[..4]}-{raw[4..]}";
    }

    public static string HashCode(string code)
    {
        var normalized = code.Replace("-", "").Trim().ToUpperInvariant();
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(bytes);
    }
}
