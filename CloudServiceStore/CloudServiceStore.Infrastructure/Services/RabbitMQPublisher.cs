using System;
using System.Text;
using System.Text.Json;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;

namespace CloudServiceStore.Infrastructure.Services;

public class RabbitMQPublisher : IRabbitMQPublisher, IDisposable
{
    private readonly RabbitMQSettings _settings;
    private readonly ILogger<RabbitMQPublisher> _logger;
    private IConnection? _connection;
    private IChannel? _channel;
    private bool _initialized = false;
    private readonly object _lock = new();

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public RabbitMQPublisher(IOptions<RabbitMQSettings> options, ILogger<RabbitMQPublisher> logger)
    {
        _settings = options.Value;
        _logger = logger;
    }

    private bool TryEnsureConnected()
    {
        if (!_settings.Enabled) return false;
        if (_initialized && _channel is { IsOpen: true }) return true;

        lock (_lock)
        {
            if (_initialized && _channel is { IsOpen: true }) return true;

            try
            {
                var factory = new ConnectionFactory
                {
                    HostName = _settings.Host,
                    Port = _settings.Port,
                    UserName = _settings.UserName,
                    Password = _settings.Password,
                    RequestedConnectionTimeout = TimeSpan.FromSeconds(5),
                    AutomaticRecoveryEnabled = true,
                    NetworkRecoveryInterval = TimeSpan.FromSeconds(10)
                };

                _connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
                _channel = _connection.CreateChannelAsync().GetAwaiter().GetResult();

                // Khai báo queues durable
                DeclareQueuesAsync().GetAwaiter().GetResult();

                _initialized = true;
                _logger.LogInformation("RabbitMQ connection established to {Host}:{Port}", _settings.Host, _settings.Port);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "RabbitMQ connection failed. Running in bypass mode.");
                _initialized = false;
                return false;
            }
        }
    }

    private async System.Threading.Tasks.Task DeclareQueuesAsync()
    {
        if (_channel == null) return;

        // Dead Letter Exchange cho provisioning
        await _channel.ExchangeDeclareAsync(
            exchange: "provisioning.dlx",
            type: ExchangeType.Direct,
            durable: true);

        await _channel.QueueDeclareAsync(
            queue: _settings.Queues.ProvisioningDeadLetter,
            durable: true, exclusive: false, autoDelete: false);

        await _channel.QueueBindAsync(
            queue: _settings.Queues.ProvisioningDeadLetter,
            exchange: "provisioning.dlx",
            routingKey: _settings.Queues.Provisioning);

        // Queue Provisioning chính với DLX
        var provArgs = new System.Collections.Generic.Dictionary<string, object?>
        {
            ["x-dead-letter-exchange"] = "provisioning.dlx",
            ["x-dead-letter-routing-key"] = _settings.Queues.Provisioning,
            ["x-max-priority"] = (object?)10
        };
        await _channel.QueueDeclareAsync(
            queue: _settings.Queues.Provisioning,
            durable: true, exclusive: false, autoDelete: false,
            arguments: provArgs);

        // Queue Order Expiry (TTL sẽ set per-message khi publish)
        await _channel.QueueDeclareAsync(
            queue: _settings.Queues.OrderExpiry,
            durable: true, exclusive: false, autoDelete: false);

        // Queue Notification Email
        await _channel.QueueDeclareAsync(
            queue: _settings.Queues.Notification,
            durable: true, exclusive: false, autoDelete: false);
    }

    public void Publish<T>(string queueName, T message)
    {
        if (!TryEnsureConnected()) return;

        try
        {
            var json = JsonSerializer.Serialize(message, JsonOptions);
            var body = Encoding.UTF8.GetBytes(json);

            var props = new BasicProperties
            {
                Persistent = true,
                ContentType = "application/json",
                Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            };

            _channel!.BasicPublishAsync(
                exchange: string.Empty,
                routingKey: queueName,
                mandatory: false,
                basicProperties: props,
                body: body).AsTask().GetAwaiter().GetResult();

            _logger.LogDebug("Published message to RabbitMQ queue: {Queue}", queueName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish message to RabbitMQ queue: {Queue}", queueName);
        }
    }

    public void PublishDelayed<T>(string queueName, T message, TimeSpan delay)
    {
        if (!TryEnsureConnected()) return;

        try
        {
            var json = JsonSerializer.Serialize(message, JsonOptions);
            var body = Encoding.UTF8.GetBytes(json);

            // ── Staging Queue Pattern (không cần plugin) ──────────────────────
            // 1. Tạo một staging queue tạm thời với:
            //    - x-message-ttl = delay → message hết hạn sau `delay`
            //    - x-dead-letter-exchange → default exchange
            //    - x-dead-letter-routing-key → tên queue đích thật
            //    - x-expires → tự xóa staging queue sau khi dùng xong
            // 2. Publish vào staging queue
            // 3. Sau `delay`, RabbitMQ dead-letter message sang queueName thật
            var stagingQueue = $"{queueName}.delay.{(long)delay.TotalMilliseconds}ms";
            var stagingArgs = new System.Collections.Generic.Dictionary<string, object?>
            {
                ["x-message-ttl"]             = (long)delay.TotalMilliseconds,
                ["x-dead-letter-exchange"]    = "",                // default exchange
                ["x-dead-letter-routing-key"] = queueName,        // target queue
                ["x-expires"]                 = (long)(delay.TotalMilliseconds * 3 + 30_000) // auto-delete staging queue
            };

            _channel!.QueueDeclareAsync(
                queue: stagingQueue,
                durable: false,
                exclusive: false,
                autoDelete: false,
                arguments: stagingArgs).GetAwaiter().GetResult();

            var props = new BasicProperties
            {
                Persistent = true,
                ContentType = "application/json",
                Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds())
            };

            _channel!.BasicPublishAsync(
                exchange: string.Empty,
                routingKey: stagingQueue,
                mandatory: false,
                basicProperties: props,
                body: body).AsTask().GetAwaiter().GetResult();

            _logger.LogDebug("Published delayed ({Delay}ms) via staging queue → {Queue}", (long)delay.TotalMilliseconds, queueName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish delayed message to RabbitMQ queue: {Queue}", queueName);
        }
    }

    public void Dispose()
    {
        try
        {
            _channel?.CloseAsync().GetAwaiter().GetResult();
            _channel?.DisposeAsync().AsTask().GetAwaiter().GetResult();
            _connection?.CloseAsync().GetAwaiter().GetResult();
            _connection?.DisposeAsync().AsTask().GetAwaiter().GetResult();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error while disposing RabbitMQ publisher.");
        }
    }
}
