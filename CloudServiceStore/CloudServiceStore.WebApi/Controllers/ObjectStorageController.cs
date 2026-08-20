using System;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ObjectStorage.Commands.CreateBucket;
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

    public ObjectStorageController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("buckets")]
    public async Task<IActionResult> CreateBucket([FromBody] CreateBucketCommand command)
    {
        var bucketId = await _mediator.Send(command);
        return Ok(new { bucketId });
    }
}
