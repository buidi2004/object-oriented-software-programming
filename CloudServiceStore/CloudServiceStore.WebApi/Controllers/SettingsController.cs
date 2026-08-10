using CloudServiceStore.Application.Features.Settings.Commands.UpdateSetting;
using CloudServiceStore.Application.Features.Settings.Queries.GetAllSettings;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Roles = "Admin")]
public class SettingsController : ControllerBase
{
    private readonly IMediator _mediator;

    public SettingsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSettings(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllSettingsQuery(), ct);
        return Ok(result);
    }

    [HttpPut("{key}")]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingCommand command, CancellationToken ct)
    {
        if (key != command.Key) return BadRequest("Key mismatch");
        var success = await _mediator.Send(command, ct);
        return success ? NoContent() : BadRequest();
    }
}
