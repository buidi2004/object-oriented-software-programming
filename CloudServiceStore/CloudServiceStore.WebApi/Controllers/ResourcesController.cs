using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/resources")]
public class ResourcesController : ControllerBase
{
    private readonly IRepository<Resource> _repository;
    private readonly IUnitOfWork _uow;

    public ResourcesController(IRepository<Resource> repository, IUnitOfWork uow)
    {
        _repository = repository;
        _uow = uow;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var resources = await _repository.GetAllAsync(ct);
        return Ok(resources.OrderByDescending(r => r.CreatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromForm] string title, [FromForm] string description, [FromForm] string category, IFormFile file, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is required.");
        }

        // Save file to wwwroot/resources
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

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var resource = await _repository.GetByIdAsync(id, ct);
        if (resource == null)
            return NotFound();

        // Try to delete physical file
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
