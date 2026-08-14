using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Carts.Commands.AddToCart;
using CloudServiceStore.Application.Features.Orders.Commands.Checkout;
using CloudServiceStore.Application.Features.Payments.Commands.ConfirmPaymentWebhook;
using CloudServiceStore.Application.Features.Payments.Commands.CreatePayment;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Tests.E2E;

public class PaymentWebhookE2ETests : BaseE2ETest
{
    public PaymentWebhookE2ETests(E2EWebApplicationFactory factory) : base(factory) { }

    [Fact]
    public async Task PaymentWebhook_WithHmacAndIdempotency_ShouldWorkCorrectly()
    {
        // 1. Setup Customer and Order
        var token = await RegisterAndLoginCustomerAsync("customer_payment@test.com", "Cust@123");
        SetAuthToken(token);

        var category = new ServiceCategory();
        category.Id = Guid.NewGuid();
        category.Name = "VPS";
        category.Slug = "vps-test";
        await AddEntityAsync(category);

        var plan = new ServicePlan(category.Id, "VPS Basic", "1", "1", "10", "100", null);
        var price = new PlanPrice();
        price.Id = Guid.NewGuid();
        price.ServicePlanId = plan.Id;
        price.BillingCycle = BillingCycle.Monthly;
        price.Price = 150000m;
        price.Currency = "VND";
        plan.AddPrice(price);
        
        await AddEntityAsync(plan);

        await Client.PostAsJsonAsync("/api/carts/items", new AddToCartCommand(plan.Id, BillingCycle.Monthly, 1));
        var checkoutRes = await Client.PostAsJsonAsync("/api/orders/checkout", new CheckoutCommand(null));
        checkoutRes.EnsureSuccessStatusCode();
        var checkoutDto = await checkoutRes.Content.ReadFromJsonAsync<CheckoutResultDto>();

        // 2. Create Payment
        var createPaymentRes = await Client.PostAsJsonAsync("/api/payments", new CreatePaymentCommand(checkoutDto!.OrderId));
        createPaymentRes.EnsureSuccessStatusCode();
        
        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CloudServiceStore.Infrastructure.Persistence.AppDbContext>();
        var payment = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(
            db.Payments, p => p.OrderId == checkoutDto.OrderId);
        
        payment.Should().NotBeNull();
        var idempotencyKey = payment!.IdempotencyKey;

        // 3. Test Fake Webhook (Invalid HMAC)
        var webhookPayload = new ConfirmPaymentWebhookCommand(idempotencyKey, 150000m);
        var fakeRequest = new HttpRequestMessage(HttpMethod.Post, "/api/payments/webhook/vnpay");
        fakeRequest.Content = JsonContent.Create(webhookPayload);
        fakeRequest.Headers.Add("X-VNPAY-Signature", "invalid_signature_123");
        
        Client.DefaultRequestHeaders.Authorization = null;

        var fakeResponse = await Client.SendAsync(fakeRequest);
        fakeResponse.StatusCode.Should().Be(System.Net.HttpStatusCode.BadRequest);
        var fakeError = await fakeResponse.Content.ReadAsStringAsync();
        fakeError.Should().Contain("Invalid signature");

        // 4. Test Valid Webhook
        var secret = "vnpay_secret_key_123";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(idempotencyKey));
        var validSignature = BitConverter.ToString(hashBytes).Replace("-", "").ToLower();

        var validRequest = new HttpRequestMessage(HttpMethod.Post, "/api/payments/webhook/vnpay");
        validRequest.Content = JsonContent.Create(webhookPayload);
        validRequest.Headers.Add("X-VNPAY-Signature", validSignature);

        var validResponse = await Client.SendAsync(validRequest);
        validResponse.EnsureSuccessStatusCode();
        var validResult = await validResponse.Content.ReadAsStringAsync();
        validResult.Should().Contain("Webhook processed");

        await db.Entry(payment).ReloadAsync();
        payment.Status.Should().Be(PaymentStatus.Confirmed);

        // 5. Test Idempotency (Duplicate Webhook call)
        var duplicateRequest = new HttpRequestMessage(HttpMethod.Post, "/api/payments/webhook/vnpay");
        duplicateRequest.Content = JsonContent.Create(webhookPayload);
        duplicateRequest.Headers.Add("X-VNPAY-Signature", validSignature);

        var duplicateResponse = await Client.SendAsync(duplicateRequest);
        duplicateResponse.EnsureSuccessStatusCode(); 
        
        await db.Entry(payment).ReloadAsync();
        payment.Status.Should().Be(PaymentStatus.Confirmed);
    }
}

public class CheckoutResultDto
{
    public Guid OrderId { get; set; }
}
