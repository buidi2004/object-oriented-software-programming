using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Configuration;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Infrastructure;

public class KafkaServiceTests
{
    private readonly Mock<ILogger<KafkaProducerService>> _loggerMock;

    public KafkaServiceTests()
    {
        _loggerMock = new Mock<ILogger<KafkaProducerService>>();
    }

    [Fact]
    public void KafkaSettings_ShouldHaveValidDefaultValues()
    {
        var settings = new KafkaSettings();

        settings.Enabled.Should().BeFalse();
        settings.BootstrapServers.Should().Be("localhost:9092");
        settings.AuditLogTopic.Should().Be("system.audit-events");
        settings.DomainEventsTopic.Should().Be("system.domain-events");
        settings.ConsumerGroupId.Should().Be("cloudservicestore-consumers");
        settings.MessageTimeoutMs.Should().Be(3000);
    }

    [Fact]
    public async Task ProduceAsync_WhenDisabled_ShouldGracefullyBypassWithoutExceptions()
    {
        var settings = Options.Create(new KafkaSettings { Enabled = false });
        using var producer = new KafkaProducerService(settings, _loggerMock.Object);

        var auditEvent = new AuditLogEvent
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Action = AuditAction.Create,
            EntityName = "VpsInstance",
            EntityId = Guid.NewGuid().ToString(),
            IpAddress = "127.0.0.1",
            Timestamp = DateTime.UtcNow
        };

        var act = async () => await producer.ProduceAuditEventAsync(auditEvent, CancellationToken.None);
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task ProduceDomainEventAsync_WhenDisabled_ShouldGracefullyBypassWithoutExceptions()
    {
        var settings = Options.Create(new KafkaSettings { Enabled = false });
        using var producer = new KafkaProducerService(settings, _loggerMock.Object);

        var orderEvent = new OrderPaidEventMessage
        {
            OrderId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            TotalAmount = 500000,
            PaymentMethod = "Wallet",
            PaidAt = DateTime.UtcNow
        };

        var act = async () => await producer.ProduceDomainEventAsync("OrderPaid", orderEvent.OrderId.ToString(), orderEvent, CancellationToken.None);
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public void UserSecurityEventMessage_ShouldInitializePropertiesCorrectly()
    {
        var userId = Guid.NewGuid();
        var message = new UserSecurityEventMessage
        {
            UserId = userId,
            Email = "user@cloudhost.vn",
            EventType = "LoginSuccess",
            IpAddress = "192.168.1.1",
            UserAgent = "Mozilla/5.0",
            IsSuccess = true
        };

        message.UserId.Should().Be(userId);
        message.Email.Should().Be("user@cloudhost.vn");
        message.EventType.Should().Be("LoginSuccess");
        message.IsSuccess.Should().BeTrue();
    }
}
