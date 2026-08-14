using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Application.Features.VpsInstances.Commands.ProvisionVps;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace CloudServiceStore.Application.Features.Payments.EventHandlers;

public class ProvisionVpsOnPaymentConfirmedHandler : INotificationHandler<PaymentConfirmedEvent>
{
    private readonly IMediator _mediator;
    private readonly IRepository<Domain.Entities.OrderRequest> _orderRepo;
    private readonly IRepository<Domain.Entities.ServiceCategory> _categoryRepo;
    private readonly ILogger<ProvisionVpsOnPaymentConfirmedHandler> _logger;

    public ProvisionVpsOnPaymentConfirmedHandler(
        IMediator mediator,
        IRepository<Domain.Entities.OrderRequest> orderRepo,
        IRepository<Domain.Entities.ServiceCategory> categoryRepo,
        ILogger<ProvisionVpsOnPaymentConfirmedHandler> logger)
    {
        _mediator = mediator;
        _orderRepo = orderRepo;
        _categoryRepo = categoryRepo;
        _logger = logger;
    }

    public async Task Handle(PaymentConfirmedEvent notification, CancellationToken cancellationToken)
    {
        var order = await _orderRepo.GetByIdAsync(notification.OrderRequestId, cancellationToken, o => o.Items!);
        if (order == null || order.Status != OrderStatus.Paid)
        {
            return;
        }

        try
        {
            await _mediator.Send(new ProvisionVpsCommand { OrderId = order.Id }, cancellationToken);
            _logger.LogInformation("Auto-provisioned VPS for order {OrderId}", order.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to auto-provision VPS for order {OrderId}", order.Id);
        }
    }
}
