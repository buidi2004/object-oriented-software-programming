namespace CloudServiceStore.Infrastructure.Configuration;

public class RabbitMQSettings
{
    public const string SectionName = "RabbitMQ";

    public bool Enabled { get; set; } = false;
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 5672;
    public string UserName { get; set; } = "guest";
    public string Password { get; set; } = "guest";
    public RabbitMQQueueNames Queues { get; set; } = new();
}

public class RabbitMQQueueNames
{
    public string Provisioning { get; set; } = "provisioning.tasks";
    public string ProvisioningDeadLetter { get; set; } = "provisioning.tasks.dlq";
    public string OrderExpiry { get; set; } = "orders.expiry";
    public string Notification { get; set; } = "notifications.email";
}
