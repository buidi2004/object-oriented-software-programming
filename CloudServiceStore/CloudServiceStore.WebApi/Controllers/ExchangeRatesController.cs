using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ExchangeRates.Commands.UpsertExchangeRate;
using CloudServiceStore.Application.Features.ExchangeRates.Queries.GetExchangeRates;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/exchange-rates")]
public class ExchangeRatesController : ControllerBase
{
    private readonly IMediator _mediator;
    public ExchangeRatesController(IMediator mediator) => _mediator = mediator;

    /// <summary>GET /api/exchange-rates — Public: view current exchange rates</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var rates = await _mediator.Send(new GetExchangeRatesQuery(), ct);
        return Ok(rates);
    }

    /// <summary>POST /api/exchange-rates — Admin: create or update an exchange rate</summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Upsert([FromBody] UpsertExchangeRateCommand command, CancellationToken ct)
    {
        var success = await _mediator.Send(command, ct);
        return Ok(new { success });
    }
}
