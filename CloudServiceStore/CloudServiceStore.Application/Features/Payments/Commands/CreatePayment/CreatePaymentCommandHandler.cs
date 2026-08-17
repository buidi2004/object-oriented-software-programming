using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Payments.Commands.CreatePayment;

public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, string>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<Payment> _paymentRepo;

    public CreatePaymentCommandHandler(IUnitOfWork uow, IRepository<OrderRequest> orderRepo, IRepository<Payment> paymentRepo)
    { _uow = uow; _orderRepo = orderRepo; _paymentRepo = paymentRepo; }

    public async Task<string> Handle(CreatePaymentCommand request, CancellationToken ct)
    {
        var order = await _orderRepo.GetByIdAsync(request.OrderRequestId, ct) ?? throw new NotFoundException("Đơn hàng không tồn tại");
        
        if (order.Status != OrderStatus.Pending)
            throw new ConflictException("Trạng thái đơn hàng không hợp lệ để thanh toán.");

        var idempotencyKey = $"PAY_{order.Id}_{DateTime.UtcNow.Ticks}";
        
        var payment = new Payment(
            order.Id,
            "VietQR",
            idempotencyKey,
            order.TotalAmount
        );

        await _paymentRepo.AddAsync(payment, ct);
        await _uow.SaveChangesAsync(ct);

        // VietQR payment image URL with MB Bank
        return $"https://img.vietqr.io/image/MB-0987654321-compact.png?amount={order.TotalAmount:0}&addInfo={idempotencyKey}&accountName=CLOUD%20SERVICE%20STORE";
    }
}
