using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ApiKeys.Commands.GenerateApiKey;

public class GenerateApiKeyCommandHandler : IRequestHandler<GenerateApiKeyCommand, string>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ApiKey> _apiKeyRepo;
    private readonly ICurrentUserService _currentUser;

    public GenerateApiKeyCommandHandler(IUnitOfWork uow, IRepository<ApiKey> apiKeyRepo, ICurrentUserService currentUser)
    { _uow = uow; _apiKeyRepo = apiKeyRepo; _currentUser = currentUser; }

    public async Task<string> Handle(GenerateApiKeyCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var plainTextKey = "cs_" + Guid.NewGuid().ToString("N");
        var keyHash = ComputeSha256Hash(plainTextKey);

        var apiKey = new ApiKey
        {
            UserId = userId,
            KeyHash = keyHash,
            Scopes = request.Scopes
        };

        await _apiKeyRepo.AddAsync(apiKey, cancellationToken);
        await _uow.SaveChangesAsync(cancellationToken);

        return plainTextKey; // Chỉ trả về 1 lần
    }
    
    private static string ComputeSha256Hash(string rawData)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(rawData));
        var builder = new StringBuilder();
        foreach (var t in bytes) builder.Append(t.ToString("x2"));
        return builder.ToString();
    }
}
