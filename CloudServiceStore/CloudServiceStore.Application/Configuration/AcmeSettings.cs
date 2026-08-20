namespace CloudServiceStore.Application.Configuration;

/// <summary>
/// Settings for Let's Encrypt / ACME v2 SSL certificate provisioning.
/// </summary>
public class AcmeSettings
{
    public const string SectionName = "Acme";

    /// <summary>
    /// ACME Environment: "Staging" (default for dev/test) or "Production".
    /// Staging: https://acme-staging-v02.api.letsencrypt.org/directory
    /// Production: https://acme-v02.api.letsencrypt.org/directory
    /// </summary>
    public string Environment { get; set; } = "Staging";

    /// <summary>
    /// Account contact email for Let's Encrypt notifications and registration.
    /// </summary>
    public string ContactEmail { get; set; } = "admin@cloudservicestore.local";

    /// <summary>
    /// Optional public IP of the host server for DNS pre-flight verification.
    /// If configured, domains must resolve to this IP before calling ACME.
    /// </summary>
    public string? ServerIp { get; set; }

    /// <summary>
    /// Base directory where ACME account key and challenges are stored on disk.
    /// </summary>
    public string StoragePath { get; set; } = "/app/provisioning-data/acme";

    /// <summary>
    /// Maximum polling timeout in seconds for order validation (default: 120s).
    /// </summary>
    public int TimeoutSeconds { get; set; } = 120;
}
