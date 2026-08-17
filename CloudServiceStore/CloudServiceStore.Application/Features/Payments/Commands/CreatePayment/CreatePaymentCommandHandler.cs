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
    private readonly IRepository<SystemSetting>? _settingRepo;

    public CreatePaymentCommandHandler(
        IUnitOfWork uow, 
        IRepository<OrderRequest> orderRepo, 
        IRepository<Payment> paymentRepo,
        IRepository<SystemSetting>? settingRepo = null)
    { 
        _uow = uow; 
        _orderRepo = orderRepo; 
        _paymentRepo = paymentRepo; 
        _settingRepo = settingRepo;
    }

    public async Task<string> Handle(CreatePaymentCommand request, CancellationToken ct)
    {
        var order = await _orderRepo.GetByIdAsync(request.OrderRequestId, ct) ?? throw new NotFoundException("Đơn hàng không tồn tại");
        
        if (order.Status != OrderStatus.Pending)
            throw new ConflictException("Trạng thái đơn hàng không hợp lệ để thanh toán.");

        var orderCode = order.Id.ToString("N")[..8].ToUpper();
        var transferContent = $"PAY{orderCode}";
        var idempotencyKey = $"PAY_{order.Id}";
        
        var payment = new Payment(
            order.Id,
            "VietQR",
            idempotencyKey,
            order.TotalAmount
        );

        await _paymentRepo.AddAsync(payment, ct);
        await _uow.SaveChangesAsync(ct);

        // VietQR payment dynamic configuration
        var bankId = "970422"; // MB Bank BIN default
        var accountNo = "0987654321";
        var accountName = "CLOUD SERVICE STORE";
        var template = "compact2";

        if (_settingRepo != null)
        {
            var sBank = await _settingRepo.FirstOrDefaultAsync(s => s.Key == "vietqr_bank_id" || s.Key == "bank_id", ct);
            if (!string.IsNullOrWhiteSpace(sBank?.Value)) bankId = sBank.Value.Trim();

            var sAcc = await _settingRepo.FirstOrDefaultAsync(s => s.Key == "vietqr_account_no" || s.Key == "bank_account_no" || s.Key == "account_number", ct);
            if (!string.IsNullOrWhiteSpace(sAcc?.Value)) accountNo = sAcc.Value.Trim();

            var sName = await _settingRepo.FirstOrDefaultAsync(s => s.Key == "vietqr_account_name" || s.Key == "bank_account_name" || s.Key == "account_name", ct);
            if (!string.IsNullOrWhiteSpace(sName?.Value)) accountName = sName.Value.Trim();

            var sTpl = await _settingRepo.FirstOrDefaultAsync(s => s.Key == "vietqr_template", ct);
            if (!string.IsNullOrWhiteSpace(sTpl?.Value)) template = sTpl.Value.Trim();
        }

        var encodedName = Uri.EscapeDataString(accountName);
        return $"https://img.vietqr.io/image/{bankId}-{accountNo}-{template}.png?amount={order.TotalAmount:0}&addInfo={transferContent}&accountName={encodedName}";
    }
}
