using System;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Messages;
using CloudServiceStore.Infrastructure.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace CloudServiceStore.Infrastructure.BackgroundServices;

/// <summary>
/// Lắng nghe queue "notifications.email" — gửi email phi đồng bộ với retry tự động khi SMTP lỗi.
/// </summary>
public class NotificationEmailConsumerWorker : BackgroundService
{
    private readonly RabbitMQSettings _settings;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<NotificationEmailConsumerWorker> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    public NotificationEmailConsumerWorker(
        IOptions<RabbitMQSettings> options,
        IServiceScopeFactory scopeFactory,
        ILogger<NotificationEmailConsumerWorker> logger)
    {
        _settings = options.Value;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_settings.Enabled)
        {
            _logger.LogInformation("NotificationEmailConsumerWorker is disabled (RabbitMQ:Enabled=false).");
            return;
        }

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

                await channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 3, global: false, cancellationToken: stoppingToken);

                await channel.QueueDeclareAsync(
                    queue: _settings.Queues.Notification,
                    durable: true, exclusive: false, autoDelete: false,
                    cancellationToken: stoppingToken);

                var consumer = new AsyncEventingBasicConsumer(channel);
                consumer.ReceivedAsync += async (_, ea) =>
                {
                    try
                    {
                        var body = Encoding.UTF8.GetString(ea.Body.ToArray());
                        var msg = JsonSerializer.Deserialize<NotificationEmailMessage>(body, JsonOptions);

                        if (msg != null)
                        {
                            await SendEmailWithRetryAsync(msg, stoppingToken);
                        }

                        await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to process NotificationEmailMessage. NACK-ing.");
                        await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
                    }
                };

                await channel.BasicConsumeAsync(
                    queue: _settings.Queues.Notification,
                    autoAck: false,
                    consumer: consumer,
                    cancellationToken: stoppingToken);

                _logger.LogInformation("NotificationEmailConsumerWorker subscribed to queue: {Queue}", _settings.Queues.Notification);

                await Task.Delay(Timeout.Infinite, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "NotificationEmailConsumerWorker error. Retrying in 10 seconds...");
                try { await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); }
                catch (OperationCanceledException) { break; }
            }
        }

        _logger.LogInformation("NotificationEmailConsumerWorker stopped.");
    }

    private async Task SendEmailWithRetryAsync(NotificationEmailMessage msg, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        const int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            try
            {
                await emailService.SendEmailAsync(msg.ToEmail, msg.Subject, msg.HtmlBody, ct);
                _logger.LogInformation("NotificationEmail: Sent email to {To} (subject: {Subject}) on attempt {Attempt}.", msg.ToEmail, msg.Subject, attempt);
                return;
            }
            catch (Exception ex) when (attempt < maxRetries)
            {
                var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt)); // exponential backoff: 2s, 4s
                _logger.LogWarning(ex, "Email send attempt {Attempt}/{Max} failed. Retrying in {Delay}s...", attempt, maxRetries, delay.TotalSeconds);
                try { await Task.Delay(delay, ct); }
                catch (OperationCanceledException) { return; }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Email send failed after {Max} attempts for recipient: {To}.", maxRetries, msg.ToEmail);
                throw;
            }
        }
    }
}
