using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ApiKeys.Queries.GetMyApiKeys;

public class GetMyApiKeysQueryHandler : IRequestHandler<GetMyApiKeysQuery, IEnumerable<ApiKey>>
{
    private readonly IRepository<ApiKey> _apiKeyRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyApiKeysQueryHandler(IRepository<ApiKey> apiKeyRepo, ICurrentUserService currentUser)
    { _apiKeyRepo = apiKeyRepo; _currentUser = currentUser; }

    public async Task<IEnumerable<ApiKey>> Handle(GetMyApiKeysQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        return await _apiKeyRepo.WhereAsync(k => k.UserId == userId, cancellationToken);
    }
}
