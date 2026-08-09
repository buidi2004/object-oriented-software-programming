using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Commands.GenerateInvoice;

public class GenerateInvoiceCommand : IRequest<Guid>
{
    public Guid OrderRequestId { get; set; }
}
