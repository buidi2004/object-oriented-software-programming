using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.HostingAccounts.Commands.CreateHostingAccount;
using CloudServiceStore.Application.Features.HostingAccounts.Queries.GetMyHostingAccounts;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/hosting")]
public class HostingController : ControllerBase
{
    private readonly IMediator _mediator;

    public HostingController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateHostingAccount([FromBody] CreateHostingAccountCommand command, CancellationToken ct)
    {
        var accountId = await _mediator.Send(command, ct);
        return Ok(new { accountId });
    }

    [HttpGet]
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMyHostingAccounts(CancellationToken ct)
    {
        var accounts = await _mediator.Send(new GetMyHostingAccountsQuery(), ct);
        return Ok(accounts);
    }
}
