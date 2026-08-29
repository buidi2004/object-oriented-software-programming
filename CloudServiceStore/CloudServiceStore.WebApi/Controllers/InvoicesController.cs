using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Invoices.Queries.GetAllInvoices;
using CloudServiceStore.Application.Features.Invoices.Queries.GetMyInvoices;
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
    public InvoicesController(IMediator mediator) => _mediator = mediator;

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
}
