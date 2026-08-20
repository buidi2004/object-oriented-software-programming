using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.WebApi.Controllers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace CloudServiceStore.Tests.Integration;

public class PaymentIdempotencyIntegrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public PaymentIdempotencyIntegrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task ConfirmPayment_CalledTwiceConcurrently_IsStrictlyIdempotentAndChargesOnlyOnce()
    {
        // 1. Arrange: Seed an order in DB
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var user = await db.AppUsers.FirstOrDefaultAsync();
        user.Should().NotBeNull();

        var order = new OrderRequest(user!.Id, new System.Collections.Generic.List<OrderItem>(), null, 0m, 250000m, false);
        db.OrderRequests.Add(order);
        await db.SaveChangesAsync();

        var idempotencyKey = $"PAY_{order.Id:N}";
        var requestPayload = new SimulateSePayRequest
        {
            IdempotencyKey = idempotencyKey,
            Amount = 250000m
        };

        // 2. Act: Call webhook twice concurrently
        var task1 = _client.PostAsJsonAsync("/api/payments/sandbox/simulate-sepay", requestPayload);
        var task2 = _client.PostAsJsonAsync("/api/payments/sandbox/simulate-sepay", requestPayload);

        var responses = await Task.WhenAll(task1, task2);

        // 3. Assert HTTP Responses
        responses[0].StatusCode.Should().Be(HttpStatusCode.OK);
        responses[1].StatusCode.Should().Be(HttpStatusCode.OK);

        // 4. Assert Database State
        using var verifyScope = _factory.Services.CreateScope();
        var verifyDb = verifyScope.ServiceProvider.GetRequiredService<AppDbContext>();

        var updatedOrder = await verifyDb.OrderRequests.FirstOrDefaultAsync(o => o.Id == order.Id);
        updatedOrder.Should().NotBeNull();
        updatedOrder!.Status.Should().Be(OrderStatus.Paid);

        var payments = await verifyDb.Payments.Where(p => p.OrderId == order.Id).ToListAsync();
        payments.Should().HaveCount(1, "Strict idempotency must ensure exactly 1 Payment record is created/confirmed");
        payments[0].Status.Should().Be(PaymentStatus.Confirmed);
    }
}
