using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Queries.GetMyWallet;

public class GetMyWalletQueryHandler : IRequestHandler<GetMyWalletQuery, Domain.Entities.Wallet>
{
    private readonly IRepository<Domain.Entities.Wallet> _walletRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IUnitOfWork _uow;

    public GetMyWalletQueryHandler(IRepository<Domain.Entities.Wallet> walletRepo, ICurrentUserService currentUser, IUnitOfWork uow)
    {
        _walletRepo = walletRepo;
        _currentUser = currentUser;
        _uow = uow;
    }

    public async Task<Domain.Entities.Wallet> Handle(GetMyWalletQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var wallets = await _walletRepo.WhereAsync(w => w.UserId == userId, cancellationToken);
        var wallet = Enumerable.FirstOrDefault(wallets);

        if (wallet == null)
        {
            wallet = new Domain.Entities.Wallet(userId);
            await _walletRepo.AddAsync(wallet, cancellationToken);
            await _uow.SaveChangesAsync(cancellationToken);
        }

        return wallet;
    }
}
