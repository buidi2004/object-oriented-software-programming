using CloudServiceStore.Application.Features.NewsArticles.Commands.Create;
using CloudServiceStore.Application.Features.NewsArticles.Commands.Delete;
using CloudServiceStore.Application.Features.NewsArticles.Commands.IncrementViewCount;
using CloudServiceStore.Application.Features.NewsArticles.Commands.Update;
using CloudServiceStore.Application.Features.NewsArticles.Queries.GetAll;
using CloudServiceStore.Application.Features.NewsArticles.Queries.GetById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NewsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NewsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllNewsArticlesQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetNewsArticleByIdQuery(id));
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateNewsArticleCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { Id = id });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNewsArticleCommand command)
    {
        if (id != command.Id)
            return BadRequest("Id in route does not match Id in command");

        var result = await _mediator.Send(command);
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteNewsArticleCommand(id));
        if (!result)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("{id}/view")]
    [AllowAnonymous]
    public async Task<IActionResult> IncrementViewCount(Guid id)
    {
        var result = await _mediator.Send(new IncrementViewCountCommand(id));
        if (!result)
            return NotFound();

        return NoContent();
    }

    // --- COMMENTS ---

    [HttpGet("{id:guid}/comments")]
    [AllowAnonymous]
    public async Task<IActionResult> GetComments(Guid id)
    {
        var comments = await _mediator.Send(new CloudServiceStore.Application.Features.NewsArticles.Queries.GetComments.GetCommentsQuery(id));
        return Ok(comments);
    }

    [HttpPost("{id:guid}/comments")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> AddComment(Guid id, [FromBody] CloudServiceStore.Application.Features.NewsArticles.Commands.AddComment.AddCommentCommand command)
    {
        if (id != command.NewsArticleId) return BadRequest("Mismatched Id");
        var commentId = await _mediator.Send(command);
        return Ok(new { commentId });
    }

    [HttpPatch("comments/{commentId:guid}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ApproveComment(Guid commentId)
    {
        var result = await _mediator.Send(new CloudServiceStore.Application.Features.NewsArticles.Commands.ApproveComment.ApproveCommentCommand(commentId));
        if (!result) return NotFound();
        return NoContent();
    }
}
