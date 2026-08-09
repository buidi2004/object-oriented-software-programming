using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Wallet.Queries.GetMyWalletTransactions;

public class GetMyWalletTransactionsQueryHandler : IRequestHandler<GetMyWalletTransactionsQuery, IEnumerable<WalletTransaction>>
{
    private readonly IRepository<Domain.Entities.Wallet> _walletRepo;
    private readonly IRepository<WalletTransaction> _transactionRepo;
    private readonly ICurrentUserService _currentUser;

    public GetMyWalletTransactionsQueryHandler(IRepository<Domain.Entities.Wallet> walletRepo, IRepository<WalletTransaction> transactionRepo, ICurrentUserService currentUser)
    { _walletRepo = walletRepo; _transactionRepo = transactionRepo; _currentUser = currentUser; }

    public async Task<IEnumerable<WalletTransaction>> Handle(GetMyWalletTransactionsQuery request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Chưa đăng nhập");
        
        var wallets = await _walletRepo.WhereAsync(w => w.UserId == userId, cancellationToken);
        var wallet = Enumerable.FirstOrDefault(wallets);
        
        if (wallet == null) return new List<WalletTransaction>();
        
        var transactions = await _transactionRepo.WhereAsync(t => t.WalletId == wallet.Id, cancellationToken);
        return transactions.OrderByDescending(t => t.CreatedAt);
    }
}
