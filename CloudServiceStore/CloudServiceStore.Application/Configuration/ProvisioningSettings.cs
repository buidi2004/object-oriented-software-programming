namespace CloudServiceStore.Application.Configuration;

public class ProvisioningSettings
{
    public const string SectionName = "Provisioning";

    public int PortRangeStart { get; set; } = 30000;
    public int PortRangeEnd { get; set; } = 40000;
    public int TimeoutSeconds { get; set; } = 60;
    public string DataPath { get; set; } = "/app/provisioning-data";
}

public class MinIOSettings
{
    public const string SectionName = "MinIO";

    public string Endpoint { get; set; } = "localhost:9000";
    public string AccessKey { get; set; } = "minioadmin";
    public string SecretKey { get; set; } = "minioadmin";
    public bool UseSSL { get; set; } = false;
}
