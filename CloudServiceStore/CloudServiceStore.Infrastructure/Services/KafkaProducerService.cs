using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Infrastructure.Configuration;
using Confluent.Kafka;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CloudServiceStore.Infrastructure.Services;

public class KafkaProducerService : IKafkaProducerService, IDisposable
{
    private readonly KafkaSettings _settings;
    private readonly ILogger<KafkaProducerService> _logger;
    private readonly IProducer<string, string>? _producer;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false
    };

    public KafkaProducerService(IOptions<KafkaSettings> options, ILogger<KafkaProducerService> logger)
    {
        _settings = options.Value;
        _logger = logger;

        if (_settings.Enabled && !string.IsNullOrWhiteSpace(_settings.BootstrapServers))
        {
            try
            {
                var config = new ProducerConfig
                {
                    BootstrapServers = _settings.BootstrapServers,
                    MessageTimeoutMs = _settings.MessageTimeoutMs > 0 ? _settings.MessageTimeoutMs : 3000,
                    Acks = Acks.Leader,
                    EnableIdempotence = false
                };

                _producer = new ProducerBuilder<string, string>(config).Build();
                _logger.LogInformation("Kafka producer successfully initialized with BootstrapServers: {Servers}", _settings.BootstrapServers);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to initialize Kafka producer. Kafka features will run in fallback/disabled mode.");
                _producer = null;
            }
        }
        else
        {
            _logger.LogInformation("Kafka is disabled or bootstrap servers not configured. Running in bypassed mode.");
        }
    }

    public async Task ProduceAsync<T>(string topic, string key, T message, CancellationToken ct = default)
    {
        if (!_settings.Enabled || _producer == null)
        {
            _logger.LogDebug("Kafka is disabled. Skipping event production to topic: {Topic}", topic);
            return;
        }

        try
        {
            var json = JsonSerializer.Serialize(message, JsonOptions);
            var kafkaMessage = new Message<string, string>
            {
                Key = key,
                Value = json,
                Timestamp = new Timestamp(DateTime.UtcNow)
            };

            var result = await _producer.ProduceAsync(topic, kafkaMessage, ct);
            _logger.LogDebug("Message delivered to {Topic} partition {Partition} at offset {Offset}", topic, result.Partition, result.Offset);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to produce message to Kafka topic: {Topic} with key: {Key}", topic, key);
        }
    }

    public async Task ProduceAuditEventAsync(AuditLogEvent auditEvent, CancellationToken ct = default)
    {
        var key = auditEvent.UserId?.ToString() ?? auditEvent.EntityId;
        await ProduceAsync(_settings.AuditLogTopic, key, auditEvent, ct);
    }

    public async Task ProduceDomainEventAsync<T>(string eventType, string key, T domainEvent, CancellationToken ct = default)
    {
        var envelope = new
        {
            EventType = eventType,
            Timestamp = DateTime.UtcNow,
            Payload = domainEvent
        };

        await ProduceAsync(_settings.DomainEventsTopic, key, envelope, ct);
    }

    public void Dispose()
    {
        try
        {
            _producer?.Flush(TimeSpan.FromSeconds(2));
            _producer?.Dispose();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error while disposing Kafka producer.");
        }
    }
}
