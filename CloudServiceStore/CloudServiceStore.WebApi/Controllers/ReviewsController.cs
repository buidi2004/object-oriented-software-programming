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

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.Reviews.Queries.GetAllReviews.GetAllReviewsQuery(), ct);
        return Ok(result);
    }

    [HttpGet("service-plan/{id:guid}")]
    public async Task<IActionResult> GetByServicePlan(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.Reviews.Queries.GetReviewsByServicePlan.GetReviewsByServicePlanQuery(id), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Create([FromBody] CloudServiceStore.Application.Features.Reviews.Commands.CreateReview.CreateReviewCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(null, new { id });
    }

    [HttpPatch("{id:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.Reviews.Commands.ApproveReview.ApproveReviewCommand(id), ct);
        return Ok(new { success = result });
    }

    [HttpPatch("{id:guid}/feature")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Feature(Guid id, [FromBody] FeatureTestimonialCommand command, CancellationToken ct)
    {
        command.ReviewId = id;
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }
}
