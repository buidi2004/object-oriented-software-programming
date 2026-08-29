using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Domains.Commands.AddDnsRecord;
using CloudServiceStore.Application.Features.Domains.Commands.DeleteDnsRecord;
using CloudServiceStore.Application.Features.Domains.Commands.RegisterDomain;
using CloudServiceStore.Application.Features.Domains.Queries.CheckDomain;
using CloudServiceStore.Application.Features.Domains.Queries.GetDnsRecords;
using CloudServiceStore.Application.Features.Domains.Queries.GetMyDomains;
using CloudServiceStore.Application.Features.Domains.Queries.GetDomainById;
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

    [HttpGet]
    [HttpGet("me")]
    [Authorize]
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

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var domain = await _mediator.Send(new GetDomainByIdQuery(id), ct);
        return Ok(domain);
    }

    // --- DNS RECORDS ---

    [HttpGet("{id:guid}/dns")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetDnsRecords(Guid id, CancellationToken ct)
    {
        var records = await _mediator.Send(new GetDnsRecordsQuery(id), ct);
        return Ok(records);
    }

    [HttpPost("{id:guid}/dns")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> AddDnsRecord(Guid id, [FromBody] AddDnsRecordCommand command, CancellationToken ct)
    {
        if (id != command.DomainId) return BadRequest("Mismatched Domain Id");
        var recordId = await _mediator.Send(command, ct);
        return Ok(new { recordId });
    }

    [HttpDelete("{id:guid}/dns/{recordId:guid}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> DeleteDnsRecord(Guid id, Guid recordId, CancellationToken ct)
    {
        await _mediator.Send(new DeleteDnsRecordCommand(id, recordId), ct);
        return NoContent();
    }
}
