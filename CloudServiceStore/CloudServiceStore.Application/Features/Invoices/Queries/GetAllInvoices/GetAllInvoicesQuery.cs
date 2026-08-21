using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Queries.GetAllInvoices;

public record GetAllInvoicesQuery() : IRequest<List<InvoiceDto>>;

public class GetAllInvoicesQueryHandler : IRequestHandler<GetAllInvoicesQuery, List<InvoiceDto>>
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<OrderRequest> _orderRepository;

    public GetAllInvoicesQueryHandler(
        IRepository<Invoice> invoiceRepository,
        IRepository<OrderRequest> orderRepository)
    {
        _invoiceRepository = invoiceRepository;
        _orderRepository = orderRepository;
    }

    public async Task<List<InvoiceDto>> Handle(GetAllInvoicesQuery request, CancellationToken cancellationToken)
    {
        var invoices = await _invoiceRepository.GetAllAsync(cancellationToken);
        var orders = await _orderRepository.GetAllAsync(cancellationToken);

        return invoices.Select(i => 
        {
            var order = orders.FirstOrDefault(o => o.Id == i.OrderId);
            return new InvoiceDto
            {
                Id = i.Id,
                OrderRequestId = i.OrderId,
                InvoiceNumber = i.InvoiceNumber,
                IssuedAt = i.IssuedAt,
                PdfUrl = i.PdfUrl,
                Amount = order?.TotalAmount ?? 0
            };
        }).OrderByDescending(x => x.IssuedAt).ToList();
    }
}
