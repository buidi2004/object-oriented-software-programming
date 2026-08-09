using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.ApiKeys.Commands.RevokeApiKey;

public class RevokeApiKeyCommandHandler : IRequestHandler<RevokeApiKeyCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ApiKey> _apiKeyRepo;
    private readonly ICurrentUserService _currentUser;

    public RevokeApiKeyCommandHandler(IUnitOfWork uow, IRepository<ApiKey> apiKeyRepo, ICurrentUserService currentUser)
    { _uow = uow; _apiKeyRepo = apiKeyRepo; _currentUser = currentUser; }

    public async Task<bool> Handle(RevokeApiKeyCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var key = await _apiKeyRepo.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("API Key không tồn tại.");
            
        if (key.UserId != userId)
            throw new UnauthorizedException("Bạn không sở hữu API Key này.");
            
        key.RevokedAt = DateTime.UtcNow;
        _apiKeyRepo.Update(key);
        await _uow.SaveChangesAsync(cancellationToken);
        
        return true;
    }
}
