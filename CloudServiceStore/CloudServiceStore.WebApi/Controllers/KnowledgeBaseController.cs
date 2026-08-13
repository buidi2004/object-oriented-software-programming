using CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;
using CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetById;
using CloudServiceStore.Application.Features.KnowledgeBase.Queries.GetPublishedKbArticles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class KnowledgeBaseController : ControllerBase
{
    private readonly IMediator _mediator;

    public KnowledgeBaseController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublished(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPublishedKbArticlesQuery(), ct);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetKbArticleByIdQuery(id));
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateKbArticleCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { Id = id });
    }
}
