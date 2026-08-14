using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Exports.Queries.ExportOrders;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/exports")]
public class ExportController : ControllerBase
{
    private readonly IMediator _mediator;
    public ExportController(IMediator mediator) => _mediator = mediator;

    [HttpGet("orders")]
    public async Task<IActionResult> ExportOrders([FromQuery] string format = "csv", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new ExportOrdersQuery(format), ct);
        return File(result.Data, result.ContentType, result.FileName);
    }
}
