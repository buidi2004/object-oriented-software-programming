using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Application.Events;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Payments.Commands.ConfirmPaymentWebhook;

public class ConfirmPaymentWebhookCommandHandler : IRequestHandler<ConfirmPaymentWebhookCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Domain.Entities.Payment> _paymentRepo;
    private readonly IRepository<Domain.Entities.OrderRequest> _orderRepo;
    private readonly IMediator _mediator;

    public ConfirmPaymentWebhookCommandHandler(IUnitOfWork uow, IRepository<Domain.Entities.Payment> paymentRepo, IRepository<Domain.Entities.OrderRequest> orderRepo, IMediator mediator)
    { _uow = uow; _paymentRepo = paymentRepo; _orderRepo = orderRepo; _mediator = mediator; }

    public async Task Handle(ConfirmPaymentWebhookCommand request, CancellationToken ct)
    {
        var rawKey = request.IdempotencyKey ?? string.Empty;
        var cleanKey = rawKey.StartsWith("PAY_", StringComparison.OrdinalIgnoreCase) 
            ? rawKey.Substring(4) 
            : rawKey;

        var guidMatch = System.Text.RegularExpressions.Regex.Match(rawKey, @"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        Guid parsedGuid = Guid.Empty;
        if (guidMatch.Success)
        {
            Guid.TryParse(guidMatch.Value, out parsedGuid);
        }
        else
        {
            Guid.TryParse(cleanKey, out parsedGuid);
        }

        var payment = await _paymentRepo.FirstOrDefaultAsync(p => 
            p.IdempotencyKey == rawKey || 
            p.IdempotencyKey.Contains(rawKey) ||
            p.IdempotencyKey.Contains(cleanKey) ||
            (parsedGuid != Guid.Empty && p.OrderId == parsedGuid), ct);

        if (payment == null && parsedGuid != Guid.Empty)
        {
            var directOrder = await _orderRepo.GetByIdAsync(parsedGuid, ct);
            if (directOrder != null && directOrder.Status == OrderStatus.Pending)
            {
                payment = new Domain.Entities.Payment(directOrder.Id, "VietQR", rawKey, directOrder.TotalAmount);
                await _paymentRepo.AddAsync(payment, ct);
                await _uow.SaveChangesAsync(ct);
            }
        }

        if (payment == null) return; // Unknown payment, ignore (Idempotent)

        if (payment.Status == PaymentStatus.Confirmed)
            return; // Already processed (Idempotent)

        if (payment.Amount != request.Amount)
            throw new Application.Exceptions.ConflictException("Số tiền thanh toán không khớp.");

        payment.Confirm(Guid.NewGuid().ToString("N")); // Mock transaction ref

        _paymentRepo.Update(payment);

        var order = await _orderRepo.GetByIdAsync(payment.OrderId, ct);
        if (order != null)
        {
            order.Pay();
            _orderRepo.Update(order);
        }

        await _uow.SaveChangesAsync(ct);

        await _mediator.Publish(new PaymentConfirmedEvent(payment.Id, payment.OrderId), ct);
    }
}
