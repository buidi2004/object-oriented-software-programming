using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Wishlists.Commands.AddToWishlist;
using CloudServiceStore.Application.Features.Wishlists.Commands.RemoveFromWishlist;
using CloudServiceStore.Application.Features.Wishlists.Queries.GetMyWishlist;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize(Roles = "Customer")]
public class WishlistsController : ControllerBase
{
    private readonly IMediator _mediator;
    public WishlistsController(IMediator mediator) => _mediator = mediator;

    [HttpGet("me")]
    public async Task<IActionResult> GetMyWishlist(CancellationToken ct)
    {
        var items = await _mediator.Send(new GetMyWishlistQuery(), ct);
        return Ok(items);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddToWishlistCommand command, CancellationToken ct)
    {
        var id = await _mediator.Send(command, ct);
        return Ok(new { id });
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Remove(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new RemoveFromWishlistCommand { Id = id }, ct);
        return Ok(new { success = result });
    }
}
