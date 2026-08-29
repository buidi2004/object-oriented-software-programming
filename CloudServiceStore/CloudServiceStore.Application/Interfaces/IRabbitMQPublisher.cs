using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IRabbitMQPublisher
{
    /// <summary>
    /// Publishes a message to a durable RabbitMQ queue immediately.
    /// </summary>
    void Publish<T>(string queueName, T message);

    /// <summary>
    /// Publishes a message with a TTL delay before it becomes consumable.
    /// </summary>
    void PublishDelayed<T>(string queueName, T message, TimeSpan delay);
}
