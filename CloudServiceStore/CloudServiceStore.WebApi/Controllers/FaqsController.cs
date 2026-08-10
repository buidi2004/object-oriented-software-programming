using CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;
using CloudServiceStore.Application.Features.Faqs.Queries.GetAllFaqs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaqsController : ControllerBase
{
    private readonly IMediator _mediator;

    public FaqsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllFaqsQuery());
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateFaqItemCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { Id = id });
    }
}
