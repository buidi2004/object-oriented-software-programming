using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.BlogComments.Commands.AddComment;
using CloudServiceStore.Application.Features.BlogComments.Commands.DeleteComment;
using CloudServiceStore.Application.Features.BlogComments.Queries.GetCommentsByArticle;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api")]
public class BlogCommentsController : ControllerBase
{
    private readonly IMediator _mediator;
    public BlogCommentsController(IMediator mediator) => _mediator = mediator;

    [HttpPost("comments")]
    [Authorize]
    public async Task<IActionResult> Create([FromBody] AddCommentCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(null, new { id });
    }

    [HttpDelete("comments/{id:guid}")]
    [Authorize]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCommentCommand(id), ct);
        return NoContent();
    }

    [HttpGet("articles/{articleId:guid}/comments")]
    public async Task<IActionResult> GetByArticle(Guid articleId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetCommentsByArticleQuery(articleId), ct);
        return Ok(result);
    }
}
