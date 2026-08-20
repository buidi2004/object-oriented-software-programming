using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ObjectStorage.Commands.CreateBucket;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/object-storage")]
[Authorize]
public class ObjectStorageController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IRepository<ObjectStorageBucket> _repo;
    private readonly ICurrentUserService _currentUser;

    public ObjectStorageController(
        IMediator mediator,
        IRepository<ObjectStorageBucket> repo,
        ICurrentUserService currentUser)
    {
        _mediator = mediator;
        _repo = repo;
        _currentUser = currentUser;
    }

    [HttpPost("buckets")]
    public async Task<IActionResult> CreateBucket([FromBody] CreateBucketCommand command)
    {
        var bucketId = await _mediator.Send(command);
        return Ok(new { bucketId });
    }

    [HttpGet("buckets")]
    public async Task<IActionResult> GetBuckets(CancellationToken ct)
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
}
