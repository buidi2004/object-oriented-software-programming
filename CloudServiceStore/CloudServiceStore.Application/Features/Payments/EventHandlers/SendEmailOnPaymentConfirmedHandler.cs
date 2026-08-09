using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Application.Features.Payments.EventHandlers;

public class SendEmailOnPaymentConfirmedHandler : INotificationHandler<PaymentConfirmedEvent>
{
    private readonly ILogger<SendEmailOnPaymentConfirmedHandler> _logger;
    public SendEmailOnPaymentConfirmedHandler(ILogger<SendEmailOnPaymentConfirmedHandler> logger) => _logger = logger;

    public Task Handle(PaymentConfirmedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation($"[MOCK EMAIL] Gửi email xác nhận thanh toán thành công cho đơn hàng {notification.OrderRequestId}, Payment {notification.PaymentId}");
        return Task.CompletedTask;
    }
}
