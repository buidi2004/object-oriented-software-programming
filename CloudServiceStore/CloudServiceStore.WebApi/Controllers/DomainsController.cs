using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Domains.Commands.RegisterDomain;
using CloudServiceStore.Application.Features.Domains.Queries.CheckDomain;
using CloudServiceStore.Application.Features.Domains.Queries.GetMyDomains;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/domains")]
public class DomainsController : ControllerBase
{
    private readonly IMediator _mediator;

    public DomainsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("check")]
    public async Task<IActionResult> CheckDomain([FromQuery] string name, CancellationToken ct)
    {
        var isAvailable = await _mediator.Send(new CheckDomainQuery(name), ct);
        return Ok(new { isAvailable });
    }

    [HttpGet("me")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyDomains(CancellationToken ct)
    {
        var domains = await _mediator.Send(new GetMyDomainsQuery(), ct);
        return Ok(domains);
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> RegisterDomain([FromBody] RegisterDomainCommand command, CancellationToken ct)
    {
        var domainId = await _mediator.Send(command, ct);
        return Ok(new { domainId });
    }
}
