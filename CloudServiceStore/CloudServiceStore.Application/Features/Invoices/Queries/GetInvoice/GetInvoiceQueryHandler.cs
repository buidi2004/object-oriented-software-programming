using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Queries.GetInvoice;

public class GetInvoiceQueryHandler : IRequestHandler<GetInvoiceQuery, InvoiceDto>
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly IRepository<Payment> _paymentRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IUnitOfWork _unitOfWork;

    public GetInvoiceQueryHandler(
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

    public async Task<InvoiceDto> Handle(GetInvoiceQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
            throw new UnauthorizedException("User not authenticated.");

        var order = await _orderRepository.GetByIdAsync(request.OrderRequestId, cancellationToken);
        if (order == null)
            throw new NotFoundException(nameof(OrderRequest), request.OrderRequestId);

        if (order.UserId != userId && !_currentUserService.IsInRole("Admin"))
            throw new UnauthorizedException("You do not have permission to view this invoice.");

        var invoice = await _invoiceRepository.FirstOrDefaultAsync(x => x.OrderId == request.OrderRequestId, cancellationToken);
        if (invoice == null)
        {
            var invNum = $"INV-{order.CreatedAt:yyyyMMdd}-{order.Id.ToString("N").Substring(0, 6).ToUpper()}";
            var pdf = $"/api/orders/{order.Id}/invoice";
            invoice = new Invoice(order.Id, invNum, pdf);
            await _invoiceRepository.AddAsync(invoice, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var payment = await _paymentRepository.FirstOrDefaultAsync(p => p.OrderId == order.Id, cancellationToken);

        return new InvoiceDto
        {
            Id = invoice.Id,
            OrderRequestId = invoice.OrderId,
            InvoiceNumber = invoice.InvoiceNumber,
            IssuedAt = invoice.IssuedAt,
            DueDate = invoice.IssuedAt.AddDays(30),
            PdfUrl = invoice.PdfUrl,
            Amount = order.TotalAmount,
            Status = order.Status == Domain.Enums.OrderStatus.Paid ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN",
            CustomerName = "Dĩ Bùi",
            CustomerAddress = "Mỹ thọ,\nPhường Cao Lãnh, Tỉnh Đồng Tháp,\nViet Nam",
            PlanName = "Cheap 4",
            ContainerName = "azvps-" + order.Id.ToString("N").Substring(0, 10),
            PaymentMethod = payment?.Gateway ?? "MBBANK Doanh Nghiệp (Dành cho K/H DN lấy hóa đơn GTGT)",
            TransactionCode = payment?.TransactionRef ?? $"PAY{order.Id.ToString("N")[..12].ToUpper()}"
        };
    }
}
