using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Messages;
using CloudServiceStore.Infrastructure.Configuration;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Infrastructure;

public class RabbitMQPublisherTests
{
    private readonly Mock<ILogger<RabbitMQPublisher>> _loggerMock;

    public RabbitMQPublisherTests()
    {
        _loggerMock = new Mock<ILogger<RabbitMQPublisher>>();
    }

    [Fact]
    public void RabbitMQSettings_ShouldHaveValidDefaultValues()
    {
        var settings = new RabbitMQSettings();

        settings.Enabled.Should().BeFalse();
        settings.Host.Should().Be("localhost");
        settings.Port.Should().Be(5672);
        settings.UserName.Should().Be("guest");
        settings.Password.Should().Be("guest");
        settings.Queues.Should().NotBeNull();
        settings.Queues.Provisioning.Should().Be("provisioning.tasks");
        settings.Queues.ProvisioningDeadLetter.Should().Be("provisioning.tasks.dlq");
        settings.Queues.OrderExpiry.Should().Be("orders.expiry");
        settings.Queues.Notification.Should().Be("notifications.email");
    }

    [Fact]
    public void Publish_WhenDisabled_ShouldBypassGracefullyWithoutException()
    {
        var settings = Options.Create(new RabbitMQSettings { Enabled = false });
        using var publisher = new RabbitMQPublisher(settings, _loggerMock.Object);

        var act = () => publisher.Publish("provisioning.tasks", new ProvisioningJobMessage
        {
            ResourceType = "VpsInstance",
            ResourceId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            IdempotencyKey = Guid.NewGuid().ToString()
        });

        act.Should().NotThrow();
    }

    [Fact]
    public void PublishDelayed_WhenDisabled_ShouldBypassGracefullyWithoutException()
    {
        var settings = Options.Create(new RabbitMQSettings { Enabled = false });
        using var publisher = new RabbitMQPublisher(settings, _loggerMock.Object);

        var act = () => publisher.PublishDelayed("orders.expiry", new OrderExpiryMessage
        {
            OrderId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        }, TimeSpan.FromMinutes(15));

        act.Should().NotThrow();
    }

    [Fact]
    public void ProvisioningJobMessage_ShouldInitializeCorrectly()
    {
        var orderId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var msg = new ProvisioningJobMessage
        {
            ResourceType = "ManagedDatabaseInstance",
            ResourceId = orderId,
            UserId = userId,
            IdempotencyKey = orderId.ToString(),
            RetryCount = 0
        };

        msg.ResourceType.Should().Be("ManagedDatabaseInstance");
        msg.ResourceId.Should().Be(orderId);
        msg.RetryCount.Should().Be(0);
        msg.EnqueuedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void OrderExpiryMessage_ShouldInitializeCorrectly()
    {
        var orderId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var msg = new OrderExpiryMessage
        {
            OrderId = orderId,
            UserId = userId
        };

        msg.OrderId.Should().Be(orderId);
        msg.UserId.Should().Be(userId);
        msg.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public void NotificationEmailMessage_ShouldInitializeWithDefaultPriority()
    {
        var msg = new NotificationEmailMessage
        {
            ToEmail = "khach@cloudhost.vn",
            Subject = "VPS của bạn đã được tạo xong",
            HtmlBody = "<p>Chúc mừng!</p>",
            RelatedOrderId = Guid.NewGuid()
        };

        msg.Priority.Should().Be(3);
        msg.ToEmail.Should().Be("khach@cloudhost.vn");
        msg.RelatedOrderId.Should().NotBeNull();
    }
}
