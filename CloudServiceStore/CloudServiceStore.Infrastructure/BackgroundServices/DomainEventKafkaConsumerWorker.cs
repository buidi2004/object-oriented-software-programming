using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Infrastructure.Configuration;
using Confluent.Kafka;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

public class DomainEventKafkaConsumerWorker : BackgroundService
{
    private readonly KafkaSettings _settings;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DomainEventKafkaConsumerWorker> _logger;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public DomainEventKafkaConsumerWorker(
        IOptions<KafkaSettings> options,
        IServiceScopeFactory scopeFactory,
        ILogger<DomainEventKafkaConsumerWorker> logger)
    {
        _settings = options.Value;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.Enabled || string.IsNullOrWhiteSpace(_settings.BootstrapServers))
        {
            _logger.LogInformation("DomainEventKafkaConsumerWorker is disabled.");
            return;
        }

        await Task.Yield();

        var config = new ConsumerConfig
        {
            BootstrapServers = _settings.BootstrapServers,
            GroupId = $"{_settings.ConsumerGroupId}-domain",
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
                    .SetErrorHandler((_, e) => _logger.LogWarning("DomainEvent Kafka Consumer error: {Reason}", e.Reason))
                    .Build();

                consumer.Subscribe(_settings.DomainEventsTopic);
                _logger.LogInformation("DomainEventKafkaConsumerWorker subscribed to topic: {Topic}", _settings.DomainEventsTopic);

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

                        _logger.LogInformation("Received Kafka Domain Event with key '{Key}': {Message}", consumeResult.Message.Key, messageValue);
                        // Process the domain event asynchronously (e.g. notify SignalR, dispatch internal workflows)
                    }
                    catch (ConsumeException ex)
                    {
                        _logger.LogWarning(ex, "DomainEvent Kafka Consume error on topic {Topic}", _settings.DomainEventsTopic);
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
                _logger.LogError(ex, "DomainEventKafkaConsumerWorker encountered an unexpected error. Retrying in 5 seconds...");
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

        _logger.LogInformation("DomainEventKafkaConsumerWorker stopped.");
    }
}
