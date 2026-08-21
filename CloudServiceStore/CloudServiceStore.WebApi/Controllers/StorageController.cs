using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.StorageBuckets.Commands.CreateBucket;
using CloudServiceStore.Application.Interfaces;
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
    private readonly IRepository<ObjectStorageBucket> _repo;
    private readonly ICurrentUserService _currentUser;

    public StorageController(
        IMediator mediator,
        IRepository<ObjectStorageBucket> repo,
        ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _repo = repo;
        _currentUser = currentUser;
    }

    [HttpGet("buckets")]
    [Authorize]
    public async Task<IActionResult> GetMyBuckets(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        var buckets = userId.HasValue
            ? await _repo.WhereAsync(b => b.UserId == userId.Value, ct)
            : await _repo.GetAllAsync(ct);

        var result = buckets.Select(b => new
        {
            id = b.Id,
            name = b.BucketName,
            bucketName = b.BucketName,
            region = b.Region,
            capacityGb = b.CapacityGB,
            status = b.Status.ToString(),
            failureReason = b.FailureReason,
            createdAt = b.CreatedAt
        }).OrderByDescending(b => b.createdAt);

        return Ok(result);
    }

    [HttpPost("buckets")]
    [Authorize]
    public async Task<IActionResult> CreateBucket([FromBody] CreateBucketCommand command, CancellationToken ct)
    {
        var bucketId = await _mediator.Send(command, ct);
        return Ok(new { bucketId });
    }
}
