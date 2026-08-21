using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Application.Features.Payments.EventHandlers;

public class GenerateInvoiceOnPaymentConfirmedHandler : INotificationHandler<PaymentConfirmedEvent>
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GenerateInvoiceOnPaymentConfirmedHandler> _logger;

    public GenerateInvoiceOnPaymentConfirmedHandler(
        IRepository<Invoice> invoiceRepository,
        IRepository<OrderRequest> orderRepository,
        IUnitOfWork unitOfWork,
        ILogger<GenerateInvoiceOnPaymentConfirmedHandler> logger)
    {
        _invoiceRepository = invoiceRepository;
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task Handle(PaymentConfirmedEvent notification, CancellationToken cancellationToken)
    {
        try
        {
            var existingInvoice = await _invoiceRepository.FirstOrDefaultAsync(x => x.OrderId == notification.OrderRequestId, cancellationToken);
            if (existingInvoice != null)
            {
                _logger.LogInformation("Invoice already exists for order {OrderId}", notification.OrderRequestId);
                return;
            }

            var order = await _orderRepository.GetByIdAsync(notification.OrderRequestId, cancellationToken);
            if (order == null)
            {
                _logger.LogWarning("Order {OrderId} not found for generating invoice", notification.OrderRequestId);
                return;
            }

            var invoiceNumber = $"INV-{DateTime.UtcNow:yyyyMMdd}-{notification.OrderRequestId.ToString("N").Substring(0, 6).ToUpper()}";
            var pdfUrl = $"/api/orders/{notification.OrderRequestId}/invoice";

            var invoice = new Invoice(
                notification.OrderRequestId,
                invoiceNumber,
                pdfUrl
            );

            await _invoiceRepository.AddAsync(invoice, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully generated invoice {InvoiceNumber} for order {OrderId}", invoiceNumber, notification.OrderRequestId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to auto-generate invoice for order {OrderId}", notification.OrderRequestId);
        }
    }
}
