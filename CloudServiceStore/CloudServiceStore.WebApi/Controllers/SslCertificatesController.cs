using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CloudServiceStore.Application.Features.Ssl.Queries.GetSslCertificates;
using CloudServiceStore.Application.Features.Ssl.Queries.GetSslCertificateById;
using CloudServiceStore.Application.Features.Ssl.Commands.RequestSslCertificate;

namespace CloudServiceStore.WebApi.Controllers;

[Route("api/ssl-certificates")]
[ApiController]
public class SslCertificatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public SslCertificatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("certificates")]
    [Authorize]
    public async Task<IActionResult> GetCertificates()
    {
        var result = await _mediator.Send(new GetSslCertificatesQuery());
        return Ok(result);
    }

    [HttpGet("certificates/{id}")]
    [Authorize]
    public async Task<IActionResult> GetCertificateById(Guid id)
    {
        var result = await _mediator.Send(new GetSslCertificateByIdQuery(id));
        if (result == null) return NotFound();
        return Ok(result);
    }
    
    [HttpPost("certificates")]
    [Authorize]
    public async Task<IActionResult> RequestCertificate([FromBody] RequestSslCertificateCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(new { CertificateId = result });
    }
}
