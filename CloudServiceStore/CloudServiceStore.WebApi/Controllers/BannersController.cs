using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Banners.Commands.CreateBanner;
using CloudServiceStore.Application.Features.Banners.Commands.UpdateBanner;
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
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateBannerCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBannerCommand command, CancellationToken ct)
    {
        command.Id = id;
        var result = await _mediator.Send(command, ct);
        return Ok(new { success = result });
    }
}
