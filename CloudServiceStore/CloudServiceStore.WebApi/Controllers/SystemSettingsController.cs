using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.SystemSettings.Commands.UpdateSetting;
using CloudServiceStore.Application.Features.SystemSettings.Queries.GetAllSettings;
using CloudServiceStore.Application.Features.SystemSettings.Queries.GetSettingByKey;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/settings")]
public class SystemSettingsController : ControllerBase
{
    private readonly IMediator _mediator;
    public SystemSettingsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllSettingsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> GetByKey(string key, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSettingByKeyQuery(key), ct);
        if (result == null) return NotFound();
        return Ok(new { value = result });
    }

    [HttpPut("{key}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string key, [FromBody] UpdateSettingCommand command, CancellationToken ct)
    {
        if (key != command.Key) return BadRequest();
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
