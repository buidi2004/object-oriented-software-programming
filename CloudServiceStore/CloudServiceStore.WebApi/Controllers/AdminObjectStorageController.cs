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

    public AdminObjectStorageController(IRepository<ObjectStorageBucket> repo)
    {
        _repo = repo;
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
}
