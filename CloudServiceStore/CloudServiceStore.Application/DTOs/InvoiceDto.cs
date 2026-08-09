using System;

namespace CloudServiceStore.Application.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid OrderRequestId { get; set; }
    public string InvoiceNumber { get; set; } = null!;
    public DateTime IssuedAt { get; set; }
    public string PdfUrl { get; set; } = null!;
}
