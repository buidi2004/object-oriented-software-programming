using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Infrastructure.Configuration;
using CloudServiceStore.Infrastructure.Persistence;
using Confluent.Kafka;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

public class AuditLogKafkaConsumerWorker : BackgroundService
{
    private readonly KafkaSettings _settings;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<AuditLogKafkaConsumerWorker> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public AuditLogKafkaConsumerWorker(
        IOptions<KafkaSettings> options,
        IServiceScopeFactory scopeFactory,
        ILogger<AuditLogKafkaConsumerWorker> logger)
    {
        _settings = options.Value;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.Enabled || string.IsNullOrWhiteSpace(_settings.BootstrapServers))
        {
            _logger.LogInformation("AuditLogKafkaConsumerWorker is disabled.");
            return;
        }

        // Allow app to startup completely
        await Task.Yield();

        var config = new ConsumerConfig
        {
            BootstrapServers = _settings.BootstrapServers,
            GroupId = $"{_settings.ConsumerGroupId}-audit",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = true,
            EnableAutoOffsetStore = true,
            SessionTimeoutMs = 10000,
            MaxPollIntervalMs = 300000
        };

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var consumer = new ConsumerBuilder<string, string>(config)
                    .SetErrorHandler((_, e) => _logger.LogWarning("Kafka Consumer error: {Reason}", e.Reason))
                    .Build();

                consumer.Subscribe(_settings.AuditLogTopic);
                _logger.LogInformation("AuditLogKafkaConsumerWorker subscribed to topic: {Topic}", _settings.AuditLogTopic);

                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var consumeResult = consumer.Consume(TimeSpan.FromMilliseconds(500));
                        if (consumeResult == null || consumeResult.IsPartitionEOF)
                        {
                            continue;
                        }

                        var messageValue = consumeResult.Message.Value;
                        if (string.IsNullOrWhiteSpace(messageValue)) continue;

                        var auditEvent = JsonSerializer.Deserialize<AuditLogEvent>(messageValue, JsonOptions);
                        if (auditEvent != null)
                        {
                            await ProcessAuditEventAsync(auditEvent, stoppingToken);
                        }
                    }
                    catch (ConsumeException ex)
                    {
                        _logger.LogWarning(ex, "Kafka Consume error on topic {Topic}", _settings.AuditLogTopic);
                    }
                }

                consumer.Close();
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AuditLogKafkaConsumerWorker encountered an unexpected error. Retrying in 5 seconds...");
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        _logger.LogInformation("AuditLogKafkaConsumerWorker stopped.");
    }

    private async Task ProcessAuditEventAsync(AuditLogEvent auditEvent, CancellationToken ct)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var auditLog = new AuditLog
            {
                Id = auditEvent.Id != Guid.Empty ? auditEvent.Id : Guid.NewGuid(),
                UserId = auditEvent.UserId,
                Action = auditEvent.Action,
                EntityName = string.IsNullOrWhiteSpace(auditEvent.EntityName) ? "System" : auditEvent.EntityName,
                EntityId = string.IsNullOrWhiteSpace(auditEvent.EntityId) ? Guid.Empty.ToString() : auditEvent.EntityId,
                IpAddress = string.IsNullOrWhiteSpace(auditEvent.IpAddress) ? "127.0.0.1" : auditEvent.IpAddress,
                Timestamp = auditEvent.Timestamp != default ? auditEvent.Timestamp : DateTime.UtcNow
            };

            dbContext.AuditLogs.Add(auditLog);
            await dbContext.SaveChangesAsync(ct);

            _logger.LogDebug("Asynchronously stored AuditLog {Id} for Entity {EntityName}:{EntityId}", auditLog.Id, auditLog.EntityName, auditLog.EntityId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to persist AuditLog from Kafka event ID: {Id}", auditEvent.Id);
        }
    }
}
