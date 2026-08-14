using System.Security.Cryptography;
using System.Text;

namespace CloudServiceStore.Application.Common;

public static class ResetTokenHasher
{
    public static string Hash(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
