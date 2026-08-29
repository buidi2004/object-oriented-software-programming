namespace CloudServiceStore.Infrastructure.Configuration;

public class KafkaSettings
{
    public const string SectionName = "Kafka";

    public bool Enabled { get; set; } = false;
    public string BootstrapServers { get; set; } = "localhost:9092";
    public string AuditLogTopic { get; set; } = "system.audit-events";
    public string DomainEventsTopic { get; set; } = "system.domain-events";
    public string ConsumerGroupId { get; set; } = "cloudservicestore-consumers";
    public int MessageTimeoutMs { get; set; } = 3000;
}
