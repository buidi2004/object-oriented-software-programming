using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.EmailHosting.Commands.CreateEmailAccount;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/email-hosting")]
public class EmailHostingController : ControllerBase
{
    private readonly IMediator _mediator;

    public EmailHostingController(IMediator mediator) => _mediator = mediator;

    [HttpGet("accounts")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyAccounts(CancellationToken ct)
    {
        return Ok(new List<object>());
    }

    [HttpPost("accounts")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateAccount([FromBody] CreateEmailAccountCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }
}
