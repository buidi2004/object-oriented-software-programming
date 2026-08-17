using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.StorageBuckets.Commands.CreateBucket;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/storage")]
public class StorageController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<StorageBucket> _repo;

    public StorageController(IMediator mediator, IRepository<StorageBucket> repo)
    {
        _mediator = mediator;
        _repo = repo;
    }

    [HttpGet("buckets")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetMyBuckets(CancellationToken ct)
    {
        return Ok(new List<object>());
    }

    [HttpPost("buckets")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateBucket([FromBody] CreateBucketCommand command, CancellationToken ct)
    {
        var bucketId = await _mediator.Send(command, ct);
        return Ok(new { bucketId });
    }
}
