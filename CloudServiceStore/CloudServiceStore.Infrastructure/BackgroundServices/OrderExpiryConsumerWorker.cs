using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Messages;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Infrastructure.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

/// <summary>
/// Lắng nghe queue "orders.expiry" — tự động huỷ đơn hàng nếu chưa thanh toán sau TTL (15 phút).
/// </summary>
public class OrderExpiryConsumerWorker : BackgroundService
{
    private readonly RabbitMQSettings _settings;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OrderExpiryConsumerWorker> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public OrderExpiryConsumerWorker(
        IOptions<RabbitMQSettings> options,
        IServiceScopeFactory scopeFactory,
        ILogger<OrderExpiryConsumerWorker> logger)
    {
        _settings = options.Value;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.Enabled)
        {
            _logger.LogInformation("OrderExpiryConsumerWorker is disabled (RabbitMQ:Enabled=false).");
            return;
        }

        // Allow app to start completely before subscribing
        await Task.Yield();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _settings.Host,
                    Port = _settings.Port,
                    UserName = _settings.UserName,
                    Password = _settings.Password,
                    AutomaticRecoveryEnabled = true,
                    NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
                };

                using var connection = await factory.CreateConnectionAsync(stoppingToken);
                using var channel = await connection.CreateChannelAsync(cancellationToken: stoppingToken);

                await channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 5, global: false, cancellationToken: stoppingToken);

                await channel.QueueDeclareAsync(
                    queue: _settings.Queues.OrderExpiry,
                    durable: true, exclusive: false, autoDelete: false,
                    cancellationToken: stoppingToken);

                var consumer = new AsyncEventingBasicConsumer(channel);
                consumer.ReceivedAsync += async (_, ea) =>
                {
                    try
                    {
                        var body = Encoding.UTF8.GetString(ea.Body.ToArray());
                        var msg = JsonSerializer.Deserialize<OrderExpiryMessage>(body, JsonOptions);

                        if (msg != null)
                        {
                            await ProcessOrderExpiryAsync(msg, stoppingToken);
                        }

                        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to process OrderExpiryMessage. NACK-ing message.");
                        await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
                    }
                };

                await channel.BasicConsumeAsync(
                    queue: _settings.Queues.OrderExpiry,
                    autoAck: false,
                    consumer: consumer,
                    cancellationToken: stoppingToken);

                _logger.LogInformation("OrderExpiryConsumerWorker subscribed to queue: {Queue}", _settings.Queues.OrderExpiry);

                // Block until shutdown
                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "OrderExpiryConsumerWorker error. Retrying in 10 seconds...");
                try { await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); }
                catch (OperationCanceledException) { break; }
            }
        }

        _logger.LogInformation("OrderExpiryConsumerWorker stopped.");
    }

    private async Task ProcessOrderExpiryAsync(OrderExpiryMessage msg, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var orderRepo = scope.ServiceProvider.GetRequiredService<IRepository<CloudServiceStore.Domain.Entities.OrderRequest>>();
        var uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

        var order = await orderRepo.GetByIdAsync(msg.OrderId, ct);
        if (order == null)
        {
            _logger.LogWarning("OrderExpiryConsumer: Order {OrderId} not found — skipping.", msg.OrderId);
            return;
        }

        if (order.Status != OrderStatus.Pending)
        {
            _logger.LogDebug("OrderExpiryConsumer: Order {OrderId} already in status {Status} — skipping.", msg.OrderId, order.Status);
            return;
        }

        order.Status = OrderStatus.Cancelled;
        await uow.SaveChangesAsync(ct);

        _logger.LogInformation("OrderExpiryConsumer: Cancelled pending order {OrderId} (user {UserId}) after TTL expiry.", msg.OrderId, msg.UserId);
    }
}
