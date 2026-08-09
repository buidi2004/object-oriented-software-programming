using System;

namespace CloudServiceStore.Domain.Entities;

public class Invoice
{
    public Guid Id { get; set; }
    public Guid OrderRequestId { get; set; }
    public string InvoiceNumber { get; set; } = null!; // unique
    public DateTime IssuedAt { get; set; }
    public string PdfUrl { get; set; } = null!;

    public OrderRequest OrderRequest { get; set; } = null!;
}
