using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Queries.GetMyWallet;

public class GetMyWalletQueryHandler : IRequestHandler<GetMyWalletQuery, Domain.Entities.Wallet>
{
    private readonly IRepository<Domain.Entities.Wallet> _walletRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyWalletQueryHandler(IRepository<Domain.Entities.Wallet> walletRepo, ICurrentUserService currentUser)
    { _walletRepo = walletRepo; _currentUser = currentUser; }

    public async Task<Domain.Entities.Wallet> Handle(GetMyWalletQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        var wallets = await _walletRepo.WhereAsync(w => w.UserId == userId, cancellationToken);
        var wallet = Enumerable.FirstOrDefault(wallets);
        
        return wallet ?? new Domain.Entities.Wallet { UserId = userId, Balance = 0 }; // Default if not exist
    }
}
