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
[Route("api/system-settings")]
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
        if (result == null)
        {
            var fallback = key.ToLowerInvariant() switch
            {
                "site_name" or "sitename" => "CloudServiceStore",
                "hotline" => "1900 8888 99",
                "email" => "support@cloudservicestore.vn",
                _ => string.Empty
            };
            return Ok(new { value = fallback });
        }
        return Ok(new { value = result });
    }

    [HttpPut("{key}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Update(string key, [FromBody] UpdateSettingCommand command, CancellationToken ct)
    {
        if (command == null) return BadRequest(new { message = "Command body is required" });
        if (!string.Equals(key, command.Key, StringComparison.OrdinalIgnoreCase))
        {
            command = command with { Key = key };
        }
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
