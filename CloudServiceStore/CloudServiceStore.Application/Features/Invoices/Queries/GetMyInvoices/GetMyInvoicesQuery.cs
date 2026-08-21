using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Queries.GetMyInvoices;

public record GetMyInvoicesQuery() : IRequest<List<InvoiceDto>>;

public class GetMyInvoicesQueryHandler : IRequestHandler<GetMyInvoicesQuery, List<InvoiceDto>>
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly IRepository<Payment> _paymentRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public GetMyInvoicesQueryHandler(
        IRepository<Invoice> invoiceRepository,
        IRepository<OrderRequest> orderRepository,
        IRepository<Payment> paymentRepository,
        ICurrentUserService currentUserService,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _orderRepository = orderRepository;
        _paymentRepository = paymentRepository;
        _currentUserService = currentUserService;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<InvoiceDto>> Handle(GetMyInvoicesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
        {
            return new List<InvoiceDto>();
        }
        
        // 1. Get user's orders
        var myOrders = await _orderRepository.WhereAsync(o => o.UserId == userId, cancellationToken);
        var myOrderIds = myOrders.Select(o => o.Id).ToList();
        
        // 2. Get invoices for those orders
        var invoices = await _invoiceRepository.WhereAsync(i => myOrderIds.Contains(i.OrderId), cancellationToken);
        var payments = await _paymentRepository.WhereAsync(p => myOrderIds.Contains(p.OrderId), cancellationToken);

        var result = new List<InvoiceDto>();
        bool hasNewInvoices = false;

        foreach (var order in myOrders)
        {
            var invoice = invoices.FirstOrDefault(i => i.OrderId == order.Id);
            if (invoice == null)
            {
                // Auto-create invoice so it's persisted and never lost
                var invNum = $"INV-{order.CreatedAt:yyyyMMdd}-{order.Id.ToString("N").Substring(0, 6).ToUpper()}";
                var pdf = $"/api/orders/{order.Id}/invoice";
                invoice = new Invoice(order.Id, invNum, pdf);
                await _invoiceRepository.AddAsync(invoice, cancellationToken);
                hasNewInvoices = true;
            }

            var payment = payments.FirstOrDefault(p => p.OrderId == order.Id);
            var isPaid = order.Status == Domain.Enums.OrderStatus.Paid;

            result.Add(new InvoiceDto
            {
                Id = invoice.Id,
                OrderRequestId = order.Id,
                InvoiceNumber = invoice.InvoiceNumber,
                IssuedAt = invoice.IssuedAt,
                DueDate = invoice.IssuedAt.AddDays(30),
                PdfUrl = invoice.PdfUrl,
                Amount = order.TotalAmount,
                Status = isPaid ? "paid" : "pending",
                CustomerName = "Dĩ Bùi",
                PaymentMethod = payment?.Gateway ?? "MBBANK Doanh Nghiệp (Dành cho K/H DN lấy hóa đơn GTGT)",
                TransactionCode = payment?.TransactionRef ?? $"PAY{order.Id.ToString("N")[..12].ToUpper()}",
                PlanName = "Cloud VPS Advanced"
            });
        }

        if (hasNewInvoices)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return result.OrderByDescending(x => x.IssuedAt).ToList();
    }
}
