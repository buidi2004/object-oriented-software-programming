using System;
using System.Collections.Generic;
using CloudServiceStore.Domain.Entities;
using MediatR;

namespace CloudServiceStore.Application.Features.ApiKeys.Queries.GetMyApiKeys;

public record GetMyApiKeysQuery : IRequest<IEnumerable<ApiKey>>;
