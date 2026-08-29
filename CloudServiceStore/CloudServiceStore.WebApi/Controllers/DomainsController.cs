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

using System.Linq;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/domains")]
public class DomainsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<DomainRecord> _domainRepo;
    private readonly IUnitOfWork _uow;
    private readonly ICurrentUserService _currentUser;

    public DomainsController(
        IMediator mediator,
        IRepository<DomainRecord> domainRepo,
        IUnitOfWork uow,
        ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _domainRepo = domainRepo;
        _uow = uow;
        _currentUser = currentUser;
    }

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

    // --- ADMIN DOMAIN MANAGEMENT ---

    [HttpGet("admin")]
    [Authorize(Roles = "Admin,Editor,Staff")]
    public async Task<IActionResult> GetAllForAdmin(CancellationToken ct)
    {
        var domains = await _domainRepo.WhereAsync(d => true, ct, d => d.User);
        var result = domains.Select(d => new
        {
            id = d.Id.ToString(),
            domainName = d.Name,
            ownerEmail = d.User?.Email ?? "customer@cloudhost.vn",
            registrar = "VNNIC / PA Vietnam",
            registeredDate = d.ExpiryDate.AddYears(-1).ToString("o"),
            expiryDate = d.ExpiryDate.ToString("o"),
            autoRenew = d.AutoRenew,
            transferLock = true,
            eppCode = "AUTH-" + d.Id.ToString("N").Substring(0, 8).ToUpper(),
            nameservers = new[] { "ns1.cloudhost.vn", "ns2.cloudhost.vn" },
            status = d.Status.ToString()
        }).ToList();

        return Ok(result);
    }

    [HttpPost("admin")]
    [Authorize(Roles = "Admin,Editor,Staff")]
    public async Task<IActionResult> AdminCreateDomain([FromBody] AdminCreateDomainRequest request, CancellationToken ct)
    {
        var domain = new DomainRecord
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId != Guid.Empty ? request.UserId : (_currentUser.UserId ?? Guid.NewGuid()),
            Name = request.DomainName.Trim().ToLower(),
            OrderRequestId = Guid.NewGuid(),
            ExpiryDate = DateTime.UtcNow.AddYears(request.Years > 0 ? request.Years : 1),
            AutoRenew = request.AutoRenew,
            Status = DomainStatus.Active,
            IsPrivacyProtected = true
        };

        await _domainRepo.AddAsync(domain, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(domain);
    }

    [HttpPut("admin/{id:guid}")]
    [Authorize(Roles = "Admin,Editor,Staff")]
    public async Task<IActionResult> AdminUpdateDomain(Guid id, [FromBody] AdminUpdateDomainRequest request, CancellationToken ct)
    {
        var domain = await _domainRepo.GetByIdAsync(id, ct);
        if (domain == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(request.DomainName)) domain.Name = request.DomainName.Trim().ToLower();
        if (request.AutoRenew.HasValue) domain.AutoRenew = request.AutoRenew.Value;
        if (!string.IsNullOrWhiteSpace(request.Status) && Enum.TryParse<DomainStatus>(request.Status, true, out var status))
        {
            domain.Status = status;
        }

        _domainRepo.Update(domain);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { success = true, domain });
    }

    [HttpDelete("admin/{id:guid}")]
    [Authorize(Roles = "Admin,Editor,Staff")]
    public async Task<IActionResult> AdminDeleteDomain(Guid id, CancellationToken ct)
    {
        var domain = await _domainRepo.GetByIdAsync(id, ct);
        if (domain == null) return NotFound();

        _domainRepo.Delete(domain);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { success = true });
    }
}

public record AdminCreateDomainRequest(Guid UserId, string DomainName, string? Registrar, int Years, bool AutoRenew);
public record AdminUpdateDomainRequest(string? DomainName, bool? AutoRenew, string? Status);
