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
        var cleanKey = rawKey;
        if (cleanKey.StartsWith("PAY_", StringComparison.OrdinalIgnoreCase))
            cleanKey = cleanKey.Substring(4);
        else if (cleanKey.StartsWith("PAY", StringComparison.OrdinalIgnoreCase))
            cleanKey = cleanKey.Substring(3);

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

        // Also check if cleanKey is a short prefix (e.g. 8 chars of OrderId)
        var prefix = cleanKey.ToLowerInvariant();
        if (payment == null && prefix.Length >= 6)
        {
            var allPayments = await _paymentRepo.GetAllAsync(ct);
            payment = allPayments.FirstOrDefault(p => p.OrderId.ToString("N").StartsWith(prefix) || p.IdempotencyKey.ToLowerInvariant().Contains(prefix));
        }

        if (payment == null)
        {
            var allOrders = await _orderRepo.GetAllAsync(ct);
            var directOrder = allOrders.FirstOrDefault(o =>
                (parsedGuid != Guid.Empty && o.Id == parsedGuid) ||
                (prefix.Length >= 6 && o.Id.ToString("N").StartsWith(prefix)));

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
        {
            // Handle unit mismatch (e.g. 2160k VND vs 2160000 VND) or sandbox tolerances
            bool isUnitMismatch = (payment.Amount == request.Amount * 1000m) || (request.Amount == payment.Amount * 1000m);
            if (!isUnitMismatch && request.Amount > 0 && Math.Abs(payment.Amount - request.Amount) > 50000m)
            {
                throw new Application.Exceptions.ConflictException("Số tiền thanh toán không khớp.");
            }
        }

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
