using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Newsletters.Commands.SubscribeNewsletter;
using CloudServiceStore.Application.Features.Newsletters.Commands.UnsubscribeNewsletter;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/newsletter")]
[Route("api/newsletters")]
public class NewsletterController : ControllerBase
{
    private readonly IMediator _mediator;
    public NewsletterController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll([FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.NewsletterSubscriber> repo, CancellationToken ct)
    {
        var list = await repo.GetAllAsync();
        return Ok(list);
    }

    [HttpPost("subscribe")]
    public async Task<IActionResult> Subscribe([FromBody] SubscribeNewsletterCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }

    [HttpDelete("unsubscribe")]
    public async Task<IActionResult> Unsubscribe([FromBody] UnsubscribeNewsletterCommand command, CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }
}
