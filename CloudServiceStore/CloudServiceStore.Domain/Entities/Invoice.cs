using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class Invoice : AggregateRoot
{
    public Guid OrderId { get; internal set; }
    public string InvoiceNumber { get; internal set; } = null!; // unique
    public DateTime IssuedAt { get; internal set; }
    public string PdfUrl { get; internal set; } = null!;

    public OrderRequest OrderRequest { get; internal set; } = null!;

    internal Invoice() { }

    public Invoice(Guid orderId, string invoiceNumber, string pdfUrl)
    {
        Id = Guid.NewGuid();
        OrderId = orderId;
        InvoiceNumber = invoiceNumber;
        PdfUrl = pdfUrl;
        IssuedAt = DateTime.UtcNow;
    }
}
