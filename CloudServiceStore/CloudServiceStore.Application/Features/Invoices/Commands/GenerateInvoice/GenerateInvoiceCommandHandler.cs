using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Commands.GenerateInvoice;

public class GenerateInvoiceCommandHandler : IRequestHandler<GenerateInvoiceCommand, Guid>
{
    private readonly IRepository<Invoice> _invoiceRepository;
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly IUnitOfWork _unitOfWork;

    public GenerateInvoiceCommandHandler(
        IRepository<Invoice> invoiceRepository,
        IRepository<OrderRequest> orderRepository,
        IUnitOfWork unitOfWork)
    {
        _invoiceRepository = invoiceRepository;
        _orderRepository = orderRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(GenerateInvoiceCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderRequestId, cancellationToken);
        if (order == null)
            throw new NotFoundException(nameof(OrderRequest), request.OrderRequestId);

        if (order.Status != CloudServiceStore.Domain.Enums.OrderStatus.Paid)
            throw new ConflictException("Invoice can only be generated for Paid orders.");

        var existingInvoice = await _invoiceRepository.FirstOrDefaultAsync(x => x.OrderId == request.OrderRequestId, cancellationToken);
        if (existingInvoice != null)
            return existingInvoice.Id;

        var invoice = new Invoice(
            request.OrderRequestId,
            $"INV-{DateTime.UtcNow:yyyyMMdd}-{request.OrderRequestId.ToString().Substring(0, 6).ToUpper()}",
            $"https://s3.cloudservicestore.com/invoices/{request.OrderRequestId}.pdf" // Mock URL
        );

        await _invoiceRepository.AddAsync(invoice, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return invoice.Id;
    }
}
