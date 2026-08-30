using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Create;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Update;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Delete;
using CloudServiceStore.Application.Features.ServicePlans.Commands.Prices;
using CloudServiceStore.Application.Features.ServicePlans.Commands.UpdateSeo;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlanById;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlanSeo;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlansWithCurrency;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetAllServicePlansAdmin;
using CloudServiceStore.Application.Features.ServicePlans.Queries.GetPlanPrices;
using CloudServiceStore.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/service-plans")]
public class ServicePlansController : ControllerBase
{
    private readonly IMediator _mediator;
    public ServicePlansController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Create([FromBody] CreateServicePlanCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(Create), new { id }, new { id }); 
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateServicePlanCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");
        await _mediator.Send(command, ct);
        return Ok(new { success = true });
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteServicePlanCommand(id), ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/qrcode")]
    [AllowAnonymous]
    public async Task<IActionResult> GetQrCode(Guid id, CancellationToken ct)
    {
        var qrBase64 = await _mediator.Send(new CloudServiceStore.Application.Features.ServicePlans.Queries.GetPlanQrCode.GetPlanQrCodeQuery(id), ct);
        return Ok(new { qrCode = qrBase64 });
    }

    // --- PLAN PRICING MANAGEMENT ---

    [HttpGet("{id:guid}/prices")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPrices(Guid id, CancellationToken ct)
    {
        var prices = await _mediator.Send(new GetPlanPricesQuery(id), ct);
        return Ok(prices);
    }

    [HttpPost("{id:guid}/prices")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> AddPrice(Guid id, [FromBody] AddPlanPriceCommand command, CancellationToken ct)
    {
        if (id != command.ServicePlanId)
            return BadRequest("ServicePlanId mismatch");
        var priceId = await _mediator.Send(command, ct);
        return Ok(new { id = priceId });
    }

    [HttpPut("{id:guid}/prices/{priceId:guid}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UpdatePrice(Guid id, Guid priceId, [FromBody] UpdatePlanPriceCommand command, CancellationToken ct)
    {
        if (id != command.ServicePlanId || priceId != command.Id)
            return BadRequest("ID mismatch");
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpDelete("{id:guid}/prices/{priceId:guid}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> DeletePrice(Guid id, Guid priceId, CancellationToken ct)
    {
        await _mediator.Send(new DeletePlanPriceCommand(priceId, id), ct);
        return NoContent();
    }

    /// <summary>GET /api/service-plans?currency=USD — Public: view prices in requested currency</summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetWithCurrency([FromQuery] string currency = "VND", CancellationToken ct = default)
    {
        var prices = await _mediator.Send(new GetServicePlansWithCurrencyQuery { Currency = currency }, ct);
        return Ok(prices);
    }

    /// <summary>GET /api/service-plans/admin — Admin: get all plans</summary>
    [HttpGet("admin")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> GetAllAdmin(CancellationToken ct)
    {
        var plans = await _mediator.Send(new GetAllServicePlansAdminQuery(), ct);
        return Ok(plans);
    }

    /// <summary>GET /api/service-plans/{id} — Public: full service plan detail</summary>
    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id, [FromQuery] string currency = "VND", CancellationToken ct = default)
    {
        var plan = await _mediator.Send(new GetServicePlanByIdQuery(id, currency), ct);
        return Ok(plan);
    }

    /// <summary>GET /api/service-plans/{id}/seo — Admin/Public: get SEO metadata for a service plan</summary>
    [HttpGet("{id:guid}/seo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetSeo(Guid id, CancellationToken ct)
    {
        var seo = await _mediator.Send(new GetServicePlanSeoQuery(id), ct);
        return Ok(seo);
    }

    /// <summary>PUT /api/service-plans/{id}/seo — Admin: update SEO metadata</summary>
    [HttpPut("{id:guid}/seo")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UpdateSeo(Guid id, [FromBody] UpdateSeoCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest("ID mismatch");
        await _mediator.Send(command, ct);
        return Ok();
    }

    [HttpPost("{id:guid}/og-image")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UploadOgImage(Guid id, Microsoft.AspNetCore.Http.IFormFile file, [FromServices] Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.ServicePlan> repo, [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không có file được chọn." });

        if (file.Length > 2 * 1024 * 1024)
            return BadRequest(new { message = "Kích thước ảnh không được vượt quá 2MB." });

        var plan = await repo.GetByIdAsync(id, ct);
        if (plan == null) return NotFound(new { message = "Gói dịch vụ không tồn tại." });

        var uploadsFolder = System.IO.Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "products", "og");
        if (!System.IO.Directory.Exists(uploadsFolder)) System.IO.Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{System.IO.Path.GetExtension(file.FileName)}";
        var filePath = System.IO.Path.Combine(uploadsFolder, fileName);

        using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var imageUrl = $"/images/products/og/{fileName}";
        plan.UpdateOpenGraphImage(imageUrl);
        repo.Update(plan);
        await uow.SaveChangesAsync(ct);

        return Ok(new { openGraphImage = imageUrl });
    }

    [HttpPost("{id:guid}/image")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> UploadImage(Guid id, Microsoft.AspNetCore.Http.IFormFile file, [FromServices] Microsoft.AspNetCore.Hosting.IWebHostEnvironment env, [FromServices] CloudServiceStore.Domain.Interfaces.IRepository<CloudServiceStore.Domain.Entities.ServicePlan> repo, [FromServices] CloudServiceStore.Domain.Interfaces.IUnitOfWork uow, CancellationToken ct)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "Không có file được chọn." });

        if (file.Length > 2 * 1024 * 1024)
            return BadRequest(new { message = "Kích thước ảnh không được vượt quá 2MB." });

        var plan = await repo.GetByIdAsync(id, ct);
        if (plan == null) return NotFound(new { message = "Gói dịch vụ không tồn tại." });

        var uploadsFolder = System.IO.Path.Combine(env.WebRootPath ?? env.ContentRootPath, "images", "products");
        if (!System.IO.Directory.Exists(uploadsFolder)) System.IO.Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{System.IO.Path.GetExtension(file.FileName)}";
        var filePath = System.IO.Path.Combine(uploadsFolder, fileName);

        using (var stream = new System.IO.FileStream(filePath, System.IO.FileMode.Create))
        {
            await file.CopyToAsync(stream, ct);
        }

        var imageUrl = $"/images/products/{fileName}";
        plan.UpdateImageUrl(imageUrl);
        repo.Update(plan);
        await uow.SaveChangesAsync(ct);

        return Ok(new { imageUrl });
    }
}
