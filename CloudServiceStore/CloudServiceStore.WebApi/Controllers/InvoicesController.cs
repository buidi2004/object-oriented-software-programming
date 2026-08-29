using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Invoices.Queries.GetAllInvoices;
using CloudServiceStore.Application.Features.Invoices.Queries.GetMyInvoices;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/invoices")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<Invoice> _invoiceRepo;
    private readonly IUnitOfWork _uow;

    public InvoicesController(
        IMediator mediator,
        IRepository<Invoice> invoiceRepo,
        IUnitOfWork uow)
    {
        _mediator = mediator;
        _invoiceRepo = invoiceRepo;
        _uow = uow;
    }

    /// <summary>Admin: GET /api/invoices - list all invoices</summary>
    [HttpGet]
    [Authorize(Roles = "Admin,Accountant,Technician,Editor,Support,Staff")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var invoices = await _mediator.Send(new GetAllInvoicesQuery(), ct);
        return Ok(invoices);
    }

    /// <summary>Customer: GET /api/invoices/me - list my invoices</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMine(CancellationToken ct)
    {
        var invoices = await _mediator.Send(new GetMyInvoicesQuery(), ct);
        return Ok(invoices);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Accountant")]
    public async Task<IActionResult> CreateInvoice([FromBody] CreateInvoiceRequest request, CancellationToken ct)
    {
        var invoiceNum = $"INV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid():N}".Substring(0, 18).ToUpper();
        var invoice = new Invoice(
            request.OrderId != Guid.Empty ? request.OrderId : Guid.NewGuid(),
            invoiceNum,
            $"/invoices/{invoiceNum}.pdf"
        );

        await _invoiceRepo.AddAsync(invoice, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(invoice);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteInvoice(Guid id, CancellationToken ct)
    {
        var invoice = await _invoiceRepo.GetByIdAsync(id, ct);
        if (invoice == null) return NotFound();

        _invoiceRepo.Delete(invoice);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { success = true });
    }
}

public record CreateInvoiceRequest(Guid OrderId, decimal Amount, string? CustomerName);
