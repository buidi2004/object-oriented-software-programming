using System;

namespace CloudServiceStore.Application.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid OrderRequestId { get; set; }
    public string InvoiceNumber { get; set; } = null!;
    public DateTime IssuedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public string PdfUrl { get; set; } = null!;
    public decimal Amount { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerAddress { get; set; }
    public string? PlanName { get; set; }
    public string? ContainerName { get; set; }
    public string? PaymentMethod { get; set; }
    public string? TransactionCode { get; set; }
    public string? Status { get; set; }
    public string? CustomerEmail { get; set; }
    public string? Type { get; set; }
}
