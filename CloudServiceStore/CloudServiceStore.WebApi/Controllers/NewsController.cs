using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.News.Commands.CreateArticle;
using CloudServiceStore.Application.Features.News.Commands.DeleteArticle;
using CloudServiceStore.Application.Features.News.Commands.PublishArticle;
using CloudServiceStore.Application.Features.News.Commands.UpdateArticle;
using CloudServiceStore.Application.Features.News.Queries.GetNewsBySlug;
using CloudServiceStore.Application.Features.News.Queries.GetNewsList;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController : ControllerBase
{
    private readonly IMediator _mediator;
    public NewsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool onlyPublished = true, CancellationToken ct = default)
    {
        // Admin can fetch all, others only published
        if (!User.IsInRole("Admin") && !User.IsInRole("Editor"))
            onlyPublished = true;

        var result = await _mediator.Send(new GetNewsListQuery(onlyPublished), ct);
        return Ok(result);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetNewsBySlugQuery(slug), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Create([FromBody] CreateNewsArticleCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetBySlug), new { slug = command.Slug }, new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNewsArticleRequest body, CancellationToken ct)
    {
        await _mediator.Send(new UpdateNewsArticleCommand(id, body.Title, body.Slug, body.Content), ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/publish")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Publish(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new PublishNewsArticleCommand(id), ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteNewsArticleCommand(id), ct);
        return NoContent();
    }

    [HttpPost("{id:guid}/image")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UploadImage(Guid id, Microsoft.AspNetCore.Http.IFormFile file, [FromServices] Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.NewsArticle> repo, [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        var article = await repo.GetByIdAsync(id, ct);
        if (article == null) return NotFound();

        var uploadsFolder = System.IO.Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "news");
        if (!System.IO.Directory.Exists(uploadsFolder))
            System.IO.Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{id}_{System.Guid.NewGuid().ToString("N")[..8]}{System.IO.Path.GetExtension(file.FileName)}";
        var filePath = System.IO.Path.Combine(uploadsFolder, fileName);

        using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var imageUrl = $"/images/news/{fileName}";
        article.UpdateThumbnailUrl(imageUrl);
        repo.Update(article);
        await uow.SaveChangesAsync(ct);

        return Ok(new { imageUrl });
    }
}

public record UpdateNewsArticleRequest(string Title, string Slug, string Content);
