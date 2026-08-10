using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Testimonials.Commands.FeatureTestimonial;
using CloudServiceStore.Application.Features.Testimonials.Queries.GetTestimonials;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/testimonials")]
public class TestimonialsController : ControllerBase
{
    private readonly IMediator _mediator;
    public TestimonialsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetTestimonialsQuery(), ct);
        return Ok(result);
    }
}
