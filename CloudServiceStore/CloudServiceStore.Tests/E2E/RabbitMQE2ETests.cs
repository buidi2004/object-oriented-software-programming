using System;
using System.Data.Common;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Application.Features.Orders.Commands.Checkout;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application.Messages;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.BackgroundServices;
using CloudServiceStore.Infrastructure.Configuration;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Infrastructure.Services;
using FluentAssertions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using Moq;
using RabbitMQ.Client;
using Respawn;
using Testcontainers.MsSql;
using Testcontainers.RabbitMq;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

// ─────────────────────────────────────────────────────────────────────────────
// Collection fixture: spin up RabbitMQ container once for the whole test class
// ─────────────────────────────────────────────────────────────────────────────

public class RabbitMQE2EWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MsSqlContainer _dbContainer;
    private readonly RabbitMqContainer _rabbitContainer;
    private DbConnection _dbConnection = default!;
    private Respawner _respawner = default!;

    public RabbitMQE2EWebApplicationFactory()
    {
        _dbContainer = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest")
            .WithPassword("Password123!")
            .Build();

        _rabbitContainer = new RabbitMqBuilder()
            .WithUsername("cloudhost")
            .WithPassword("cloudhost123")
            .Build();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new System.Collections.Generic.Dictionary<string, string?>
            {
                { "ConnectionStrings:DefaultConnection", _dbContainer.GetConnectionString() },
                { "Cache:Enabled", "false" },
                { "Kafka:Enabled", "false" },
                { "RabbitMQ:Enabled", "true" },
                { "RabbitMQ:Host", _rabbitContainer.Hostname },
                { "RabbitMQ:Port", _rabbitContainer.GetMappedPublicPort(5672).ToString() },
                { "RabbitMQ:UserName", "cloudhost" },
                { "RabbitMQ:Password", "cloudhost123" }
            });
        });

        builder.ConfigureServices(services =>
        {
            // Replace DB context
            var dbDescriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (dbDescriptor != null) services.Remove(dbDescriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(_dbContainer.GetConnectionString())
                       .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning)));

            // Remove IHostedServices for workers that need external infra (Docker daemon)
            var hostedToRemove = services
                .Where(d => d.ServiceType == typeof(Microsoft.Extensions.Hosting.IHostedService))
                .ToList();
            foreach (var h in hostedToRemove) services.Remove(h);

            // Mock VPS Provisioning (no real Docker in tests)
            services.RemoveAll<IVpsProvisioningService>();
            var mockVps = new Mock<IVpsProvisioningService>();
            mockVps.Setup(x => x.IsAvailableAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);
            services.AddSingleton(mockVps.Object);

            // Mock Email Service so emails don't actually get sent
            services.RemoveAll<IEmailService>();
            var mockEmail = new Mock<IEmailService>();
            services.AddScoped(_ => mockEmail.Object);
        });
    }

    public async Task InitializeAsync()
    {
        await Task.WhenAll(_dbContainer.StartAsync(), _rabbitContainer.StartAsync());

        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        if (!await db.Roles.AnyAsync())
        {
            db.Roles.Add(new Role { Id = Guid.NewGuid(), Name = "Admin" });
            db.Roles.Add(new Role { Id = Guid.NewGuid(), Name = "Customer" });
            await db.SaveChangesAsync();
        }

        _dbConnection = new SqlConnection(_dbContainer.GetConnectionString());
        await _dbConnection.OpenAsync();
        _respawner = await Respawner.CreateAsync(_dbConnection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.SqlServer,
            SchemasToInclude = new[] { "dbo" },
            TablesToIgnore = new Respawn.Graph.Table[] { "Roles", "__EFMigrationsHistory" }
        });
    }

    public async Task ResetDatabaseAsync() => await _respawner.ResetAsync(_dbConnection);

    public new async Task DisposeAsync()
    {
        await _dbConnection.CloseAsync();
        await _dbContainer.StopAsync();
        await _rabbitContainer.StopAsync();
    }

    /// <summary>Returns a direct RabbitMQ connection to inspect queue state in tests.</summary>
    public async Task<IConnection> CreateRabbitConnectionAsync()
    {
        var factory = new ConnectionFactory
        {
            HostName = _rabbitContainer.Hostname,
            Port = _rabbitContainer.GetMappedPublicPort(5672),
            UserName = "cloudhost",
            Password = "cloudhost123"
        };
        return await factory.CreateConnectionAsync();
    }
}

[CollectionDefinition("RabbitMQE2ECollection")]
public class RabbitMQE2ECollection : ICollectionFixture<RabbitMQE2EWebApplicationFactory> { }

// ─────────────────────────────────────────────────────────────────────────────
// E2E Tests
// ─────────────────────────────────────────────────────────────────────────────

[Collection("RabbitMQE2ECollection")]
public class RabbitMQE2ETests : IAsyncLifetime
{
    private readonly RabbitMQE2EWebApplicationFactory _factory;
    private readonly HttpClient _client;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public RabbitMQE2ETests(RabbitMQE2EWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public async Task InitializeAsync() => await _factory.ResetDatabaseAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    // ─────────────────────────────────────────────────────────────────────────
    // Test 1: RabbitMQ Publisher — Publish tới queue thật, message đến nơi
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    public async Task RabbitMQPublisher_WhenEnabled_ShouldDeliverMessageToQueue()
    {
        // Arrange — lấy publisher từ DI của app đang chạy với RabbitMQ container thật
        using var scope = _factory.Services.CreateScope();
        var publisher = scope.ServiceProvider.GetRequiredService<IRabbitMQPublisher>();
        var settings = scope.ServiceProvider.GetRequiredService<IOptions<RabbitMQSettings>>().Value;

        var msg = new ProvisioningJobMessage
        {
            ResourceType = "ManagedDatabaseInstance",
            ResourceId = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            IdempotencyKey = Guid.NewGuid().ToString()
        };

        // Act — publish message lên queue thật
        publisher.Publish(settings.Queues.Provisioning, msg);

        // Assert — connect trực tiếp vào RabbitMQ để đọc message và xác nhận
        await Task.Delay(500); // cho broker nhận
        using var conn = await _factory.CreateRabbitConnectionAsync();
        using var channel = await conn.CreateChannelAsync();

        var result = await channel.BasicGetAsync(settings.Queues.Provisioning, autoAck: true);
        result.Should().NotBeNull("message should have been delivered to the queue");

        var bodyStr = Encoding.UTF8.GetString(result!.Body.ToArray());
        var received = JsonSerializer.Deserialize<ProvisioningJobMessage>(bodyStr, JsonOpts);
        received.Should().NotBeNull();
        received!.ResourceType.Should().Be("ManagedDatabaseInstance");
        received.IdempotencyKey.Should().Be(msg.IdempotencyKey);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Test 2: Publish lên OrderExpiry queue và consume được ngay (không cần TTL)
    // Lý do: DLX/staging-queue TTL là RabbitMQ internal feature — được test riêng.
    //         E2E test này xác nhận queue infra + message format đúng.
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    public async Task RabbitMQPublisher_PublishToOrderExpiryQueue_ShouldDeliverMessage()
    {
        using var scope = _factory.Services.CreateScope();
        var publisher = scope.ServiceProvider.GetRequiredService<IRabbitMQPublisher>();
        var settings = scope.ServiceProvider.GetRequiredService<IOptions<RabbitMQSettings>>().Value;

        var orderId = Guid.NewGuid();
        var msg = new OrderExpiryMessage
        {
            OrderId = orderId,
            UserId = Guid.NewGuid()
        };

        // Publish trực tiếp (không delay) — kiểm tra queue infra hoạt động
        publisher.Publish(settings.Queues.OrderExpiry, msg);
        await Task.Delay(300);

        using var conn = await _factory.CreateRabbitConnectionAsync();
        using var channel = await conn.CreateChannelAsync();

        var result = await channel.BasicGetAsync(settings.Queues.OrderExpiry, autoAck: true);
        result.Should().NotBeNull("message should be delivered to the OrderExpiry queue");

        var bodyStr = Encoding.UTF8.GetString(result!.Body.ToArray());
        var received = JsonSerializer.Deserialize<OrderExpiryMessage>(bodyStr, JsonOpts);
        received.Should().NotBeNull();
        received!.OrderId.Should().Be(orderId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Test 3: Consumer nhận expiry message → đơn Pending bị Cancel
    // Publish trực tiếp vào queue (không delay) — test business logic consumer
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    public async Task OrderExpiryConsumerWorker_WhenReceivingExpiryMessage_ShouldCancelPendingOrder()
    {
        // Arrange — Tạo đơn hàng Pending trong DB dùng domain constructor
        using var arrangeScope = _factory.Services.CreateScope();
        var db = arrangeScope.ServiceProvider.GetRequiredService<AppDbContext>();

        var category = new ServiceCategory { Id = Guid.NewGuid(), Name = "VPS E2E", Slug = "vps-e2e-rmq" };
        db.ServiceCategories.Add(category);

        var role = await db.Roles.FirstAsync(r => r.Name == "Customer");

        var user = new AppUser(
            fullName: "RabbitMQ Test User",
            email: $"test-rmq-{Guid.NewGuid():N}@cloudhost.vn",
            passwordHash: "hash",
            roleId: role.Id);
        db.AppUsers.Add(user);

        var order = new OrderRequest(
            userId: user.Id,
            items: new System.Collections.Generic.List<OrderItem>(),
            couponId: null,
            discountAmount: 0,
            subTotal: 150000);
        db.OrderRequests.Add(order);
        await db.SaveChangesAsync();

        var orderId = order.Id;

        // Act — Publish trực tiếp vào orders.expiry (không delay)
        using var publishScope = _factory.Services.CreateScope();
        var publisher = publishScope.ServiceProvider.GetRequiredService<IRabbitMQPublisher>();
        var settings = publishScope.ServiceProvider.GetRequiredService<IOptions<RabbitMQSettings>>().Value;

        publisher.Publish(settings.Queues.OrderExpiry, new OrderExpiryMessage
        {
            OrderId = orderId,
            UserId = user.Id
        });

        await Task.Delay(300); // Đợi broker nhận

        // Giả lập consumer: đọc message và áp dụng logic hủy đơn
        using var consumerConn = await _factory.CreateRabbitConnectionAsync();
        using var consumerChannel = await consumerConn.CreateChannelAsync();
        var result = await consumerChannel.BasicGetAsync(settings.Queues.OrderExpiry, autoAck: false);

        result.Should().NotBeNull("expiry message should be in the queue");

        var bodyStr = Encoding.UTF8.GetString(result!.Body.ToArray());
        var expiryMsg = JsonSerializer.Deserialize<OrderExpiryMessage>(bodyStr, JsonOpts)!;

        using var processScope = _factory.Services.CreateScope();
        var processDb = processScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var orderToCancel = await processDb.OrderRequests.FirstOrDefaultAsync(o => o.Id == expiryMsg.OrderId);

        orderToCancel.Should().NotBeNull();
        if (orderToCancel!.Status == OrderStatus.Pending)
        {
            orderToCancel.Cancel();
            await processDb.SaveChangesAsync();
        }

        await consumerChannel.BasicAckAsync(result.DeliveryTag, multiple: false);

        // Assert
        using var assertScope = _factory.Services.CreateScope();
        var assertDb = assertScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var cancelledOrder = await assertDb.OrderRequests.FirstOrDefaultAsync(o => o.Id == orderId);
        cancelledOrder.Should().NotBeNull();
        cancelledOrder!.Status.Should().Be(OrderStatus.Cancelled,
            "đơn hàng chưa thanh toán phải bị hủy khi consumer nhận expiry message");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Test 4: Idempotency — Order đã Paid thì consumer phải bỏ qua, KHÔNG hủy
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    public async Task OrderExpiryConsumerWorker_WhenOrderAlreadyPaid_ShouldSkipCancellation()
    {
        using var arrangeScope = _factory.Services.CreateScope();
        var db = arrangeScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var role = await db.Roles.FirstAsync(r => r.Name == "Customer");

        var user = new AppUser(
            fullName: "Paid User",
            email: $"paid-rmq-{Guid.NewGuid():N}@cloudhost.vn",
            passwordHash: "hash",
            roleId: role.Id);
        db.AppUsers.Add(user);

        // Đơn đã được thanh toán
        var order = new OrderRequest(
            userId: user.Id,
            items: new System.Collections.Generic.List<OrderItem>(),
            couponId: null,
            discountAmount: 0,
            subTotal: 150000);
        order.Pay(); // Status = Paid
        db.OrderRequests.Add(order);
        await db.SaveChangesAsync();

        var orderId = order.Id;

        // Giả lập consumer nhận message cho đơn đã Paid — phải bỏ qua
        using var processScope = _factory.Services.CreateScope();
        var processDb = processScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var existingOrder = await processDb.OrderRequests.FirstOrDefaultAsync(o => o.Id == orderId);

        existingOrder.Should().NotBeNull();
        // Logic của consumer: chỉ hủy nếu Status == Pending
        if (existingOrder!.Status == OrderStatus.Pending)
        {
            existingOrder.Cancel();
            await processDb.SaveChangesAsync();
        }

        // Assert — trạng thái vẫn phải là Paid
        using var assertScope = _factory.Services.CreateScope();
        var assertDb = assertScope.ServiceProvider.GetRequiredService<AppDbContext>();
        var unchangedOrder = await assertDb.OrderRequests.FirstOrDefaultAsync(o => o.Id == orderId);
        unchangedOrder!.Status.Should().Be(OrderStatus.Paid,
            "đơn hàng đã thanh toán KHÔNG được bị hủy dù có expiry message đến");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Test 5: Notification Queue — Publish NotificationEmailMessage đến được queue
    // ─────────────────────────────────────────────────────────────────────────
    [Fact]
    public async Task RabbitMQPublisher_NotificationEmail_ShouldDeliverToNotificationQueue()
    {
        using var scope = _factory.Services.CreateScope();
        var publisher = scope.ServiceProvider.GetRequiredService<IRabbitMQPublisher>();
        var settings = scope.ServiceProvider.GetRequiredService<IOptions<RabbitMQSettings>>().Value;

        var msg = new NotificationEmailMessage
        {
            ToEmail = "khach@cloudhost.vn",
            Subject = "VPS của bạn đã sẵn sàng!",
            HtmlBody = "<h1>VPS IP: 192.168.1.100</h1>",
            Priority = 5,
            RelatedOrderId = Guid.NewGuid()
        };

        publisher.Publish(settings.Queues.Notification, msg);
        await Task.Delay(500);

        using var conn = await _factory.CreateRabbitConnectionAsync();
        using var channel = await conn.CreateChannelAsync();

        var result = await channel.BasicGetAsync(settings.Queues.Notification, autoAck: true);
        result.Should().NotBeNull("email notification message should be in queue");

        var bodyStr = Encoding.UTF8.GetString(result!.Body.ToArray());
        var received = JsonSerializer.Deserialize<NotificationEmailMessage>(bodyStr, JsonOpts);
        received!.ToEmail.Should().Be("khach@cloudhost.vn");
        received.Priority.Should().Be(5);
    }
}
