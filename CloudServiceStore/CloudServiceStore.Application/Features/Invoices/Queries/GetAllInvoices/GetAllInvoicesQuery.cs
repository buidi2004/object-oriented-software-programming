using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Queries.GetAllInvoices;

public record GetAllInvoicesQuery() : IRequest<List<InvoiceDto>>;

public class GetAllInvoicesQueryHandler : IRequestHandler<GetAllInvoicesQuery, List<InvoiceDto>>
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly IRepository<AppUser> _userRepository;
    private readonly IRepository<Payment> _paymentRepository;
    private readonly IRepository<Domain.Entities.Wallet> _walletRepository;
    private readonly IRepository<WalletTransaction> _transactionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GetAllInvoicesQueryHandler(
        IRepository<Invoice> invoiceRepository,
        IRepository<OrderRequest> orderRepository,
        IRepository<AppUser> userRepository,
        IRepository<Payment> paymentRepository,
        IRepository<Domain.Entities.Wallet> walletRepository,
        IRepository<WalletTransaction> transactionRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _orderRepository = orderRepository;
        _userRepository = userRepository;
        _paymentRepository = paymentRepository;
        _walletRepository = walletRepository;
        _transactionRepository = transactionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<InvoiceDto>> Handle(GetAllInvoicesQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepository.GetAllAsync(cancellationToken);
        var invoices = await _invoiceRepository.GetAllAsync(cancellationToken);
        var users = await _userRepository.GetAllAsync(cancellationToken);
        var payments = await _paymentRepository.GetAllAsync(cancellationToken);
        var wallets = await _walletRepository.GetAllAsync(cancellationToken);
        var transactions = await _transactionRepository.GetAllAsync(cancellationToken);

        var result = new List<InvoiceDto>();
        bool hasNewInvoices = false;

        // 1. Process Order Invoices
        foreach (var order in orders)
        {
            var invoice = invoices.FirstOrDefault(i => i.OrderId == order.Id);
            if (invoice == null)
            {
                var invNum = $"INV-{order.CreatedAt:yyyyMMdd}-{order.Id.ToString("N").Substring(0, 6).ToUpper()}";
                var pdf = $"/api/orders/{order.Id}/invoice";
                invoice = new Invoice(order.Id, invNum, pdf);
                await _invoiceRepository.AddAsync(invoice, cancellationToken);
                hasNewInvoices = true;
            }

            var user = users.FirstOrDefault(u => u.Id == order.UserId);
            var payment = payments.FirstOrDefault(p => p.OrderId == order.Id);
            var isPaid = order.Status == OrderStatus.Paid;

            result.Add(new InvoiceDto
            {
                Id = invoice.Id,
                OrderRequestId = order.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                IssuedAt = invoice.IssuedAt,
                DueDate = invoice.IssuedAt.AddDays(30),
                PdfUrl = invoice.PdfUrl,
                Amount = order.TotalAmount,
                Status = isPaid ? "paid" : order.Status == OrderStatus.Cancelled ? "cancelled" : "pending",
                CustomerName = user?.FullName ?? user?.Email ?? "Khách hàng CloudHost",
                CustomerEmail = user?.Email ?? "Chưa có email",
                CustomerAddress = user?.AddressLine ?? user?.City ?? "Việt Nam",
                PaymentMethod = payment?.Gateway ?? (isPaid ? "Số dư ví / Chuyển khoản VietQR" : "Chưa thanh toán"),
                TransactionCode = payment?.TransactionRef ?? $"PAY{order.Id.ToString("N")[..10].ToUpper()}",
                PlanName = "Đơn hàng dịch vụ Cloud",
                Type = "Order"
            });
        }

        // 2. Process Wallet TopUp Transactions
        var topUpTransactions = transactions.Where(t => t.Type == TransactionType.TopUp);
        foreach (var tx in topUpTransactions)
        {
            var wallet = wallets.FirstOrDefault(w => w.Id == tx.WalletId);
            var user = wallet != null ? users.FirstOrDefault(u => u.Id == wallet.UserId) : null;
            var cleanId = tx.Id.ToString("N")[..8].ToUpper();
            var invNum = $"INV-TOPUP-{tx.CreatedAt:yyyyMMdd}-{cleanId}";

            result.Add(new InvoiceDto
            {
                Id = tx.Id,
                OrderRequestId = tx.Id,
                InvoiceNumber = invNum,
                IssuedAt = tx.CreatedAt,
                DueDate = tx.CreatedAt,
                PdfUrl = $"/api/wallet/transactions",
                Amount = Math.Abs(tx.Amount),
                Status = "paid",
                CustomerName = user?.FullName ?? user?.Email ?? "Khách hàng CloudHost",
                CustomerEmail = user?.Email ?? "Chưa có email",
                CustomerAddress = user?.AddressLine ?? user?.City ?? "Việt Nam",
                PaymentMethod = "Chuyển khoản VietQR (MB Bank 24/7)",
                TransactionCode = $"TOPUP{cleanId}",
                PlanName = "Nạp tiền vào ví CloudHost VN",
                Type = "TopUp"
            });
        }

        if (hasNewInvoices)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return result.OrderByDescending(x => x.IssuedAt).ToList();
    }
}
