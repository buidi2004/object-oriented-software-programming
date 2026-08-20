using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Marketplace.Commands.PurchaseListing;
using CloudServiceStore.Application.Features.Marketplace.Queries.GetAllMarketplacePurchases;
using CloudServiceStore.Application.Features.Marketplace.Queries.GetAllMarketplaceListings;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/marketplace")]
public class MarketplaceController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<MarketplaceListing> _repo;

    public MarketplaceController(IMediator mediator, IRepository<MarketplaceListing> repo)
    {
        _mediator = mediator;
        _repo = repo;
    }

    [HttpGet("listings")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetListings(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllMarketplaceListingsQuery(), ct);
        return Ok(result);
    }

    [HttpPost("purchase/{id:guid}")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> Purchase(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new PurchaseListingCommand(id), ct);
        return Ok(new { purchaseId = result });
    }

    [HttpGet("purchases/admin")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> GetAllMarketplacePurchasesForAdmin(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetAllMarketplacePurchasesQuery(), ct);
        return Ok(result);
    }
}