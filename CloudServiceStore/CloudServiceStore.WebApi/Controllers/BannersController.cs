using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Banners.Commands.CreateBanner;
using CloudServiceStore.Application.Features.Banners.Commands.UpdateBanner;
using CloudServiceStore.Application.Features.Banners.Commands.DeleteBanner;
using CloudServiceStore.Application.Features.Banners.Queries.GetBanners;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/banners")]
public class BannersController : ControllerBase
{
    private readonly IMediator _mediator;
    public BannersController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var banners = await _mediator.Send(new GetBannersQuery(), ct);
        return Ok(banners);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Create([FromBody] CreateBannerCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBannerCommand command, CancellationToken ct)
    {
        command.Id = id;
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteBannerCommand(id), ct);
        return NoContent();
    }

    [HttpPost("upload")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UploadStandalone(Microsoft.AspNetCore.Http.IFormFile file, [FromServices] Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (false)
            return BadRequest(new { message = "File size exceeds limit." });

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be an image." });

        var uploadsFolder = System.IO.Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "banners");
        if (!System.IO.Directory.Exists(uploadsFolder))
            System.IO.Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{System.Guid.NewGuid():N}{System.IO.Path.GetExtension(file.FileName)}";
        var filePath = System.IO.Path.Combine(uploadsFolder, fileName);

        using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var imageUrl = $"/images/banners/{fileName}";
        return Ok(new { imageUrl });
    }

    [HttpPost("{id:guid}/image")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadImage(Guid id, Microsoft.AspNetCore.Http.IFormFile file, [FromServices] Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.Banner> repo, [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (false)
            return BadRequest(new { message = "File size exceeds limit." });

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be an image." });

        var banner = await repo.GetByIdAsync(id, ct);
        if (banner == null) return NotFound();

        var uploadsFolder = System.IO.Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "banners");
        if (!System.IO.Directory.Exists(uploadsFolder))
            System.IO.Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{id}_{System.Guid.NewGuid().ToString("N")[..8]}{System.IO.Path.GetExtension(file.FileName)}";
        var filePath = System.IO.Path.Combine(uploadsFolder, fileName);

        using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var imageUrl = $"/images/banners/{fileName}";
        banner.ImageUrl = imageUrl;
        repo.Update(banner);
        await uow.SaveChangesAsync(ct);

        return Ok(new { imageUrl });
    }
}
