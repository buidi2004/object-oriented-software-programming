namespace CloudServiceStore.Application.Configuration;

public class VpsSettings
{
    public const string SectionName = "Vps";

    public string DefaultImage { get; set; } = "vps-demo-image";

    /// <summary>
    /// When set, overrides billing-cycle TTL for quick local testing.
    /// </summary>
    public int? DemoTtlMinutes { get; set; }
}
