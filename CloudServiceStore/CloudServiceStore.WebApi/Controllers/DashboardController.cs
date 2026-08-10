using CloudServiceStore.Application.Features.Dashboard.Queries.ExportRevenueStats;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("revenue-stats/export")]
    public async Task<IActionResult> ExportRevenueStats([FromQuery] string format = "csv")
    {
        var csvBytes = await _mediator.Send(new ExportRevenueStatsQuery(format));
        return File(csvBytes, "text/csv", "revenue-stats.csv");
    }
}
