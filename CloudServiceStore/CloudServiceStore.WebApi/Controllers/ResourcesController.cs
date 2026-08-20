using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Resources.Commands.TrackResourceDownload;
using CloudServiceStore.Application.Features.Resources.Queries.GetDownloadableResources;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/resources")]
public class ResourcesController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<Resource> _repository;
    private readonly IUnitOfWork _uow;

    public ResourcesController(IMediator mediator, IRepository<Resource> repository, IUnitOfWork uow)
    {
        _mediator = mediator;
        _repository = repository;
        _uow = uow;
    }

    // Query resources qua MediatR
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll([FromQuery] string? keyword, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDownloadableResourcesQuery(keyword), ct);
        return Ok(result);
    }

    // Track download count qua MediatR
    [HttpPost("{id:guid}/download")]
    [Authorize]
    public async Task<IActionResult> TrackDownload(Guid id, CancellationToken ct)
    {
        var downloadCount = await _mediator.Send(new TrackResourceDownloadCommand(id), ct);
        return Ok(new { downloadCount });
    }

    // Tạo resource mới (upload file)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromForm] string title, [FromForm] string description, [FromForm] string category, IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is required.");
        }

        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "images", "resources");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var resource = new Resource
        {
            Title = title,
            Description = description,
            Category = category,
            FileUrl = $"/images/resources/{uniqueFileName}",
            FileSize = file.Length,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(resource, ct);
        await _uow.SaveChangesAsync(ct);

        return Ok(resource);
    }

    // Xóa resource
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var resource = await _repository.GetByIdAsync(id, ct);
        if (resource == null)
            return NotFound();

        try
        {
            var fileName = Path.GetFileName(resource.FileUrl);
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "images", "resources", fileName);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }
        }
        catch { /* ignore */ }

        _repository.Delete(resource);
        await _uow.SaveChangesAsync(ct);
        return NoContent();
    }
}
