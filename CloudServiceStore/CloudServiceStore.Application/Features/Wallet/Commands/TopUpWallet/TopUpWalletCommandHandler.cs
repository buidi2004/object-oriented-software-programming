using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Commands.TopUpWallet;

public class TopUpWalletCommandHandler : IRequestHandler<TopUpWalletCommand, bool>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<Domain.Entities.Wallet> _walletRepo;
    private readonly IRepository<WalletTransaction> _transactionRepo;
    private readonly ICurrentUserService _currentUser;

    public TopUpWalletCommandHandler(IUnitOfWork uow, IRepository<Domain.Entities.Wallet> walletRepo, IRepository<WalletTransaction> transactionRepo, ICurrentUserService currentUser)
    { _uow = uow; _walletRepo = walletRepo; _transactionRepo = transactionRepo; _currentUser = currentUser; }

    public async Task<bool> Handle(TopUpWalletCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");

        var wallets = await _walletRepo.WhereAsync(w => w.UserId == userId, cancellationToken);
        var wallet = wallets.FirstOrDefault();

        if (wallet == null)
        {
            wallet = new Domain.Entities.Wallet(userId);
            await _walletRepo.AddAsync(wallet, cancellationToken);
        }

        wallet.Deposit(request.Amount);
        _walletRepo.Update(wallet);

        var transaction = new WalletTransaction(wallet.Id, request.Amount, TransactionType.TopUp);
        await _transactionRepo.AddAsync(transaction, cancellationToken);

        await _uow.SaveChangesAsync(cancellationToken);
        return true;
    }
}
