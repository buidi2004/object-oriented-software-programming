using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Testimonials.Commands.FeatureTestimonial;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IMediator _mediator;
    public ReviewsController(IMediator mediator) => _mediator = mediator;

    [HttpPatch("{id:guid}/feature")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Feature(Guid id, [FromBody] FeatureTestimonialCommand command, CancellationToken ct)
    {
        command.ReviewId = id;
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }
}
