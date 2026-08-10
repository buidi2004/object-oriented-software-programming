using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlansWithCurrency;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/service-plans")]
public class ServicePlansController : ControllerBase
{
    private readonly IMediator _mediator;
    public ServicePlansController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Create(CreateServicePlanCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Create), new { id }, new { id }); 
    }

    /// <summary>GET /api/service-plans?currency=USD — Public: view prices in requested currency</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetWithCurrency([FromQuery] string currency = "VND", CancellationToken ct = default)
    {
        var prices = await _mediator.Send(new GetServicePlansWithCurrencyQuery { Currency = currency }, ct);
        return Ok(prices);
    }
}
