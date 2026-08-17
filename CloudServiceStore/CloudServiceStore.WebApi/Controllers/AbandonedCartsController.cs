using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.AbandonedCarts.Commands.SendReminders;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/abandoned-carts")]
[Authorize(Roles = "Admin")]
public class AbandonedCartsController : ControllerBase
{
    private readonly IMediator _mediator;
    public AbandonedCartsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.Cart> repo,
        CancellationToken ct)
    {
        var carts = await repo.GetAllAsync();
        return Ok(carts);
    }

    [HttpPost("send-reminders")]
    public async Task<IActionResult> SendReminders(CancellationToken ct)
    {
        var count = await _mediator.Send(new SendAbandonedCartRemindersCommand(), ct);
        return Ok(new { SentCount = count });
    }
}
