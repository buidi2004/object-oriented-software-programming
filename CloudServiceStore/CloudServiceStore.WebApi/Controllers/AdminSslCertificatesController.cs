using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Ssl.Commands.DownloadPrivateKey;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/ssl-certificates")]
[Authorize(Roles = "Admin")]
public class AdminSslCertificatesController : ControllerBase
{
    private readonly IRepository<SslCertificate> _sslRepo;
    private readonly IUnitOfWork _uow;
    private readonly IMediator _mediator;

    public AdminSslCertificatesController(
        IRepository<SslCertificate> sslRepo,
        IUnitOfWork uow,
        IMediator mediator)
    {
        _sslRepo = sslRepo;
        _uow = uow;
        _mediator = mediator;
    }

    [HttpGet]
    [HttpGet("certificates")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var certs = await _sslRepo.WhereAsync(s => true, ct, s => s.Domain!, s => s.Domain!.User!);

        var result = certs.Select(s => new
        {
            id = s.Id,
            domainName = s.Domain?.Name ?? "Unknown Domain",
            ownerEmail = s.Domain?.User?.Email ?? "customer@cloudhost.vn",
            issuer = "Let's Encrypt",
            issuedDate = s.ExpiryDate.HasValue ? s.ExpiryDate.Value.AddDays(-90) : DateTime.UtcNow,
            expiryDate = s.ExpiryDate,
            certificate = s.Certificate,
            hasPrivateKey = !string.IsNullOrWhiteSpace(s.PrivateKey),
            status = s.Status.ToString(),
            failureReason = s.FailureReason,
            createdAt = s.ExpiryDate.HasValue ? s.ExpiryDate.Value.AddDays(-90) : DateTime.UtcNow
        }).OrderByDescending(s => s.expiryDate);

        return Ok(result);
    }

    [HttpPost("{id:guid}/download-private-key")]
    public async Task<IActionResult> DownloadPrivateKey(Guid id, CancellationToken ct)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
        var privateKey = await _mediator.Send(new DownloadPrivateKeyCommand(id, ip), ct);
        return Ok(new { success = true, privateKey });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCertificate(Guid id, CancellationToken ct)
    {
        var cert = await _sslRepo.GetByIdAsync(id, ct);
        if (cert == null) return NotFound();

        _sslRepo.Delete(cert);
        await _uow.SaveChangesAsync(ct);

        return Ok(new { success = true });
    }
}
