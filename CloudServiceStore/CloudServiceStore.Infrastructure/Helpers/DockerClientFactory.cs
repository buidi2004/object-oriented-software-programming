using System;
using Docker.DotNet;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Infrastructure.Helpers;

/// <summary>
/// Singleton factory for creating and managing Docker client connections.
/// Reused by all provisioning services to avoid creating multiple connections.
/// </summary>
public sealed class DockerClientFactory : IDisposable
{
    private readonly ILogger<DockerClientFactory> _logger;
    private readonly Lazy<IDockerClient?> _client;

    public DockerClientFactory(ILogger<DockerClientFactory> logger)
    {
        _logger = logger;
        _client = new Lazy<IDockerClient?>(() =>
        {
            try
            {
                var dockerUri = Environment.OSVersion.Platform == PlatformID.Win32NT
                    ? "npipe://./pipe/docker_engine"
                    : "unix:///var/run/docker.sock";

                var client = new DockerClientConfiguration(new Uri(dockerUri))
                    .CreateClient();

                _logger.LogInformation("DockerClient created successfully, connecting to {DockerUri}", dockerUri);
                return client;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to create DockerClient. Docker-based provisioning will be unavailable.");
                return null;
            }
        });
    }

    /// <summary>
    /// Gets the shared Docker client instance. Returns null if Docker is not available.
    /// </summary>
    public IDockerClient? Client => _client.Value;

    /// <summary>
    /// Gets the Docker client or throws if Docker is not available.
    /// Use this when Docker is required (e.g., in provisioning services).
    /// </summary>
    public IDockerClient GetRequiredClient()
    {
        return Client ?? throw new InvalidOperationException(
            "Docker daemon is not available. Ensure Docker is installed and the socket is mounted.");
    }

    public void Dispose()
    {
        if (_client.IsValueCreated)
        {
            _client.Value?.Dispose();
        }
    }
}
