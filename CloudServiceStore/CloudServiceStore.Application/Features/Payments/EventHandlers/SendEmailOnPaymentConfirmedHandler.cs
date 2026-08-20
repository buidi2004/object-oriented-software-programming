using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Application.Features.Payments.EventHandlers;

public class SendEmailOnPaymentConfirmedHandler : INotificationHandler<PaymentConfirmedEvent>
{
    private readonly IEmailService _emailService;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<AppUser> _userRepo;
    private readonly ILogger<SendEmailOnPaymentConfirmedHandler> _logger;

    public SendEmailOnPaymentConfirmedHandler(
        IEmailService emailService,
        IRepository<OrderRequest> orderRepo,
        IRepository<AppUser> userRepo,
        ILogger<SendEmailOnPaymentConfirmedHandler> logger)
    {
        _emailService = emailService;
        _orderRepo = orderRepo;
        _userRepo = userRepo;
        _logger = logger;
    }

    public async Task Handle(PaymentConfirmedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var order = await _orderRepo.GetByIdAsync(notification.OrderRequestId, cancellationToken);
            if (order == null)
            {
                _logger.LogWarning("Order {OrderId} not found for email notification", notification.OrderRequestId);
                return;
            }

            var user = await _userRepo.GetByIdAsync(order.UserId, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("User {UserId} not found for email notification", order.UserId);
                return;
            }

            // Get service name from order items
            var serviceName = "Cloud Service";
            var allOrders = await _orderRepo.GetAllAsync(cancellationToken);
            // Try to extract a meaningful service name from the order
            if (order.TotalAmount > 0)
            {
                serviceName = $"Dịch vụ Cloud (Đơn #{order.Id.ToString()[..8].ToUpper()})";
            }

            await _emailService.SendPaymentSuccessEmailAsync(
                user.Email,
                order.Id.ToString(),
                serviceName,
                cancellationToken);

            _logger.LogInformation("✅ Payment confirmation email sent to {Email} for order {OrderId}", 
                user.Email, notification.OrderRequestId);
        }
        catch (Exception ex)
        {
            // Don't let email failure crash the payment flow
            _logger.LogError(ex, "❌ Failed to send payment confirmation email for order {OrderId}", 
                notification.OrderRequestId);
        }
    }
}
