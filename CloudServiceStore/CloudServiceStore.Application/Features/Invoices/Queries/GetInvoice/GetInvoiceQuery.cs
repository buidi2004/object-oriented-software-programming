using System;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.Invoices.Queries.GetInvoice;

public class GetInvoiceQuery : IRequest<InvoiceDto>
{
    public Guid OrderRequestId { get; set; }
}
