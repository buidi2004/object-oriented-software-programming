using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;
using CloudServiceStore.Application.Features.Ssl.Queries.GetMySslCertificates;
using CloudServiceStore.Application.Features.Ssl.Queries.GetSslCertificateById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/ssl")]
[Authorize(Roles = "Customer")]
public class SslController : ControllerBase
{
    private readonly IMediator _mediator;

    public SslController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetMySslCertificates(CancellationToken ct)
    {
        var certificates = await _mediator.Send(new GetMySslCertificatesQuery(), ct);
        return Ok(certificates);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSslCertificateById(Guid id, CancellationToken ct)
    {
        var certificate = await _mediator.Send(new GetSslCertificateByIdQuery(id), ct);
        return Ok(certificate);
    }

    [HttpPost]
    public async Task<IActionResult> RequestSslCertificate([FromBody] RequestSslCertificateCommand command, CancellationToken ct)
    {
        var sslId = await _mediator.Send(command, ct);
        return Ok(new { sslId });
    }
}
