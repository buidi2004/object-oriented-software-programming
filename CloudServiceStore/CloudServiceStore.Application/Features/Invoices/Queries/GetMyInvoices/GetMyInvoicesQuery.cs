using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Queries.GetMyInvoices;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime IssuedAt { get; set; }
    public string PdfUrl { get; set; } = string.Empty;
    // We can include TotalAmount from order for convenience
    public decimal Amount { get; set; }
}

public record GetMyInvoicesQuery() : IRequest<List<InvoiceDto>>;

public class GetMyInvoicesQueryHandler : IRequestHandler<GetMyInvoicesQuery, List<InvoiceDto>>
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetMyInvoicesQueryHandler(
        IRepository<Invoice> invoiceRepository,
        IRepository<OrderRequest> orderRepository,
        ICurrentUserService currentUserService)
    {
        _invoiceRepository = invoiceRepository;
        _orderRepository = orderRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<InvoiceDto>> Handle(GetMyInvoicesQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        
        // 1. Get user's orders
        var myOrders = await _orderRepository.WhereAsync(o => o.UserId == userId, cancellationToken);
        var myOrderIds = myOrders.Select(o => o.Id).ToList();
        
        // 2. Get invoices for those orders
        var invoices = await _invoiceRepository.WhereAsync(i => myOrderIds.Contains(i.OrderId), cancellationToken);

        return invoices.Select(i => 
        {
            var order = myOrders.FirstOrDefault(o => o.Id == i.OrderId);
            return new InvoiceDto
            {
                Id = i.Id,
                OrderId = i.OrderId,
                InvoiceNumber = i.InvoiceNumber,
                IssuedAt = i.IssuedAt,
                PdfUrl = i.PdfUrl,
                Amount = order?.TotalAmount ?? 0
            };
        }).OrderByDescending(x => x.IssuedAt).ToList();
    }
}
