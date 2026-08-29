using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.WebApi.Controllers;

[ApiController]
[Route("api/admin/storage")]
[Authorize(Roles = "Admin")]
public class AdminObjectStorageController : ControllerBase
{
    private readonly IRepository<ObjectStorageBucket> _repo;
    private readonly IUnitOfWork _uow;

    public AdminObjectStorageController(IRepository<ObjectStorageBucket> repo, IUnitOfWork uow)
    {
        _repo = repo;
        _uow = uow;
    }

    [HttpGet("buckets")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var buckets = await _repo.WhereAsync(b => true, ct, b => b.User!);

        var result = buckets.Select(b => new
        {
            id = b.Id,
            name = b.BucketName,
            bucketName = b.BucketName,
            ownerEmail = b.User?.Email ?? "customer@cloudhost.vn",
            region = b.Region,
            capacityGb = b.CapacityGB,
            status = b.Status.ToString(),
            failureReason = b.FailureReason,
            createdAt = b.CreatedAt
        }).OrderByDescending(b => b.createdAt);

        return Ok(result);
    }

    [HttpPost("buckets")]
    public async Task<IActionResult> CreateBucket([FromBody] AdminCreateBucketRequest request, CancellationToken ct)
    {
        var bucket = new ObjectStorageBucket
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId != Guid.Empty ? request.UserId : Guid.NewGuid(),
            BucketName = string.IsNullOrWhiteSpace(request.BucketName) ? $"bucket-{Guid.NewGuid():N}".Substring(0, 14) : request.BucketName.ToLower(),
            Region = string.IsNullOrWhiteSpace(request.Region) ? "ap-southeast-1" : request.Region,
            CapacityGB = request.CapacityGB > 0 ? request.CapacityGB : 100,
            CreatedAt = DateTime.UtcNow
        };
        bucket.MarkAsProvisioning();
        bucket.MarkAsActive();

        await _repo.AddAsync(bucket, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(bucket);
    }

    [HttpPut("buckets/{id:guid}")]
    public async Task<IActionResult> UpdateBucket(Guid id, [FromBody] AdminUpdateBucketRequest request, CancellationToken ct)
    {
        var bucket = await _repo.GetByIdAsync(id, ct);
        if (bucket == null) return NotFound();

        if (request.CapacityGB.HasValue && request.CapacityGB.Value > 0) bucket.CapacityGB = request.CapacityGB.Value;
        if (!string.IsNullOrWhiteSpace(request.Region)) bucket.Region = request.Region;

        _repo.Update(bucket);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { success = true, bucket });
    }

    [HttpDelete("buckets/{id:guid}")]
    public async Task<IActionResult> DeleteBucket(Guid id, CancellationToken ct)
    {
        var bucket = await _repo.GetByIdAsync(id, ct);
        if (bucket == null) return NotFound();

        _repo.Delete(bucket);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { success = true });
    }
}

public record AdminCreateBucketRequest(Guid UserId, string BucketName, string Region, int CapacityGB);
public record AdminUpdateBucketRequest(int? CapacityGB, string? Region);
