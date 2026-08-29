using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;

namespace CloudServiceStore.Application.Interfaces;

public interface IKafkaProducerService
{
    Task ProduceAsync<T>(string topic, string key, T message, CancellationToken ct = default);
    Task ProduceAuditEventAsync(AuditLogEvent auditEvent, CancellationToken ct = default);
    Task ProduceDomainEventAsync<T>(string eventType, string key, T domainEvent, CancellationToken ct = default);
}
