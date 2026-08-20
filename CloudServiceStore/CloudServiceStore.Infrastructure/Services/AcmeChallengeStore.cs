using System;
using System.Collections.Concurrent;
using System.IO;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CloudServiceStore.Infrastructure.Services;

/// <summary>
/// Thread-safe in-memory and disk-backed store for ACME HTTP-01 challenge responses.
/// </summary>
public class AcmeChallengeStore : IAcmeChallengeStore
{
    private readonly ConcurrentDictionary<string, string> _challenges = new();
    private readonly ILogger<AcmeChallengeStore> _logger;
    private readonly string _challengeDir;

    public AcmeChallengeStore(IOptions<AcmeSettings> settings, ILogger<AcmeChallengeStore> logger)
    {
        _logger = logger;
        var storagePath = settings.Value.StoragePath;
        _challengeDir = Path.Combine(storagePath, "challenges");

        try
        {
            Directory.CreateDirectory(_challengeDir);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not create ACME challenge directory on disk: {Path}", _challengeDir);
        }
    }

    public void SetChallenge(string token, string keyAuthorization)
    {
        _challenges[token] = keyAuthorization;

        try
        {
            var filePath = Path.Combine(_challengeDir, token);
            File.WriteAllText(filePath, keyAuthorization);
            _logger.LogInformation("ACME challenge set for token {Token} (disk & memory)", token);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write challenge token to disk: {Token}", token);
        }
    }

    public string? GetChallenge(string token)
    {
        if (_challenges.TryGetValue(token, out var keyAuthz))
        {
            return keyAuthz;
        }

        // Fallback to disk read
        try
        {
            var filePath = Path.Combine(_challengeDir, token);
            if (File.Exists(filePath))
            {
                var content = File.ReadAllText(filePath);
                _challenges[token] = content;
                return content;
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read challenge token from disk: {Token}", token);
        }

        return null;
    }

    public void RemoveChallenge(string token)
    {
        _challenges.TryRemove(token, out _);

        try
        {
            var filePath = Path.Combine(_challengeDir, token);
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
            _logger.LogInformation("ACME challenge cleaned up for token {Token}", token);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete challenge token file from disk: {Token}", token);
        }
    }
}
