using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Categories.Commands.Create;
using CloudServiceStore.Application.Features.Categories.Commands.Delete;
using CloudServiceStore.Application.Features.Categories.Queries.GetCategories;
using CloudServiceStore.Application.Features.Categories.Queries.GetCategoryPlansBySlug;
using CloudServiceStore.Application.Features.Categories.Commands.Update;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private readonly IMediator _mediator;
    public CategoriesController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await _mediator.Send(new GetCategoriesQuery(), ct));

    /// <summary>GET /api/categories/{slug}/plans?currency=VND — Public: plans in a category</summary>
    [HttpGet("{slug}/plans")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPlansBySlug(string slug, [FromQuery] string currency = "VND", CancellationToken ct = default)
    {
        var result = await _mediator.Send(new GetCategoryPlansBySlugQuery(slug, currency), ct);
        return Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateCategoryCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return CreatedAtAction(nameof(GetAll), new { id }, id);
    }


    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, UpdateCategoryCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest(new { message = "ID trong URL và body không khớp." });
            
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCategoryCommand(id), ct);
        return NoContent();
    }
}
