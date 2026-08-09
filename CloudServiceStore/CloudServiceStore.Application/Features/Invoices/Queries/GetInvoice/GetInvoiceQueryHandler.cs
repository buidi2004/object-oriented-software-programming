using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Queries.GetInvoice;

public class GetInvoiceQueryHandler : IRequestHandler<GetInvoiceQuery, InvoiceDto>
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetInvoiceQueryHandler(
        IRepository<Invoice> invoiceRepository,
        IRepository<OrderRequest> orderRepository,
        ICurrentUserService currentUserService)
    {
        _invoiceRepository = invoiceRepository;
        _orderRepository = orderRepository;
        _currentUserService = currentUserService;
    }

    public async Task<InvoiceDto> Handle(GetInvoiceQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (userId == null)
            throw new UnauthorizedException("User not authenticated.");

        var order = await _orderRepository.GetByIdAsync(request.OrderRequestId, cancellationToken);
        if (order == null)
            throw new NotFoundException(nameof(OrderRequest), request.OrderRequestId);

        if (order.UserId != userId)
            throw new UnauthorizedException("You do not have permission to view this invoice.");

        var invoice = await _invoiceRepository.FirstOrDefaultAsync(x => x.OrderRequestId == request.OrderRequestId, cancellationToken);
        if (invoice == null)
            throw new NotFoundException(nameof(Invoice), request.OrderRequestId);

        return new InvoiceDto
        {
            Id = invoice.Id,
            OrderRequestId = invoice.OrderRequestId,
            InvoiceNumber = invoice.InvoiceNumber,
            IssuedAt = invoice.IssuedAt,
            PdfUrl = invoice.PdfUrl
        };
    }
}
