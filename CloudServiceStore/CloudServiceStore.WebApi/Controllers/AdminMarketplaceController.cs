using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Marketplace.Commands.ApproveMarketplaceListing;
using CloudServiceStore.Application.Features.Marketplace.Commands.SuspendMarketplaceListing;
using CloudServiceStore.Application.Features.Marketplace.Queries.GetAdminMarketplaceListings;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/marketplace")]
[Authorize(Roles = "Admin")]
public class AdminMarketplaceController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminMarketplaceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllListings(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetAdminMarketplaceListingsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}/approve")]
    public async Task<IActionResult> ApproveListing(Guid id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new ApproveMarketplaceListingCommand(id), cancellationToken);
        return NoContent();
    }

    public record SuspendDto(string Reason);

    [HttpPut("{id:guid}/suspend")]
    public async Task<IActionResult> SuspendListing(Guid id, [FromBody] SuspendDto dto, CancellationToken cancellationToken)
    {
        await _mediator.Send(new SuspendMarketplaceListingCommand(id, dto.Reason), cancellationToken);
        return NoContent();
    }
}
