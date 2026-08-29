using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ApiKeys.Commands.GenerateApiKey;
using CloudServiceStore.Application.Features.ApiKeys.Commands.RevokeApiKey;
using CloudServiceStore.Application.Features.ApiKeys.Queries.GetMyApiKeys;
using CloudServiceStore.Application.Features.ApiKeys.Queries.GetAllApiKeys;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/api-keys")]
public class ApiKeysController : ControllerBase
{
    private readonly IMediator _mediator;
    public ApiKeysController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [HttpGet("me")]
    [Authorize(Roles = "Customer,Admin,Staff,Technician")]
    public async Task<IActionResult> GetMyApiKeys(CancellationToken ct)
    {
        var keys = await _mediator.Send(new GetMyApiKeysQuery(), ct);
        return Ok(keys);
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GenerateApiKey([FromBody] GenerateApiKeyCommand command, CancellationToken ct)
    {
        var plainTextKey = await _mediator.Send(command, ct);
        return Ok(new { key = plainTextKey });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Customer,Admin")]
    public async Task<IActionResult> RevokeApiKey(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new RevokeApiKeyCommand(id), ct);
        return Ok(new { success = result });
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> GetAllApiKeysForAdmin(CancellationToken ct)
    {
        var keys = await _mediator.Send(new GetAllApiKeysQuery(), ct);
        return Ok(keys);
    }
}
