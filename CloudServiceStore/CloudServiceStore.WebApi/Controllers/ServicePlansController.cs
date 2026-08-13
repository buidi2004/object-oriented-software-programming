using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using CloudServiceStore.Application.Features.ServicePlans.Commands.UpdateSeo;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlanById;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlanSeo;
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

    /// <summary>GET /api/service-plans/{id} — Public: full service plan detail</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string currency = "VND", CancellationToken ct = default)
    {
        var plan = await _mediator.Send(new GetServicePlanByIdQuery(id, currency), ct);
        return Ok(plan);
    }

    /// <summary>GET /api/service-plans/{id}/seo — Admin/Public: get SEO metadata for a service plan</summary>
    [HttpGet("{id:guid}/seo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSeo(Guid id, CancellationToken ct)
    {
        var seo = await _mediator.Send(new GetServicePlanSeoQuery(id), ct);
        return Ok(seo);
    }

    /// <summary>PUT /api/service-plans/{id}/seo — Admin: update SEO metadata</summary>
    [HttpPut("{id:guid}/seo")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UpdateSeo(Guid id, [FromBody] UpdateSeoCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");
        await _mediator.Send(command, ct);
        return Ok();
    }
}
