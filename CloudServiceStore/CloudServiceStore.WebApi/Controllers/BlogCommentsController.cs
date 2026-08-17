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

    [HttpGet("comments")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> GetAll(
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.ArticleComment> repo,
        CancellationToken ct)
    {
        var comments = await repo.GetAllAsync(ct);
        return Ok(comments);
    }

    [HttpPut("comments/{id:guid}/approve")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Approve(
        Guid id,
        [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.ArticleComment> repo,
        [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow,
        CancellationToken ct)
    {
        var comment = await repo.GetByIdAsync(id, ct);
        if (comment == null) return NotFound();

        comment.IsApproved = true;
        repo.Update(comment);
        await uow.SaveChangesAsync(ct);
        return NoContent();
    }
}
