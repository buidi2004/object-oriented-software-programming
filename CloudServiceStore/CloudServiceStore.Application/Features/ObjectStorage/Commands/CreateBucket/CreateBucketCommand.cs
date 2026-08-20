using System;
using MediatR;

namespace CloudServiceStore.Application.Features.ObjectStorage.Commands.CreateBucket;

public record CreateBucketCommand(
    string BucketName,
    string Region,
    string IdempotencyKey) : IRequest<Guid>;
