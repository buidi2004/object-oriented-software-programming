using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ApiKeys.Queries.GetAllApiKeys;

public record GetAllApiKeysQuery : IRequest<IEnumerable<ApiKey>>;

public class GetAllApiKeysQueryHandler : IRequestHandler<GetAllApiKeysQuery, IEnumerable<ApiKey>>
{
    private readonly IRepository<ApiKey> _apiKeyRepo;

    public GetAllApiKeysQueryHandler(IRepository<ApiKey> apiKeyRepo)
    {
        _apiKeyRepo = apiKeyRepo;
    }

    public async Task<IEnumerable<ApiKey>> Handle(GetAllApiKeysQuery request, CancellationToken cancellationToken)
    {
        return await _apiKeyRepo.GetAllAsync(cancellationToken);
    }
}
