using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.NotificationSettings.Commands.UpdateNotificationSetting;
using CloudServiceStore.Application.Features.NotificationSettings.Queries.GetMyNotificationSetting;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/notification-settings")]
public class NotificationSettingsController : ControllerBase
{
    private readonly IMediator _mediator;
    public NotificationSettingsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMySetting(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyNotificationSettingQuery(), ct);
        return Ok(result);
    }

    [HttpPut("me")]
    [Authorize]
    public async Task<IActionResult> UpdateSetting([FromBody] UpdateNotificationSettingCommand command, CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }
}
