using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Reports.Queries.GetSpendingBreakdown;

public class GetSpendingBreakdownQueryHandler : IRequestHandler<GetSpendingBreakdownQuery, IReadOnlyList<SpendingCategoryDto>>
{
    private readonly IRepository<OrderRequest> _orderRepo;
    private readonly IRepository<Wallet> _walletRepo;
    private readonly IRepository<WalletTransaction> _walletTransactionRepo;
    private readonly ICurrentUserService _currentUser;

    public GetSpendingBreakdownQueryHandler(
        IRepository<OrderRequest> orderRepo,
        IRepository<Wallet> walletRepo,
        IRepository<WalletTransaction> walletTransactionRepo,
        ICurrentUserService currentUser)
    {
        _orderRepo = orderRepo;
        _walletRepo = walletRepo;
        _walletTransactionRepo = walletTransactionRepo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<SpendingCategoryDto>> Handle(GetSpendingBreakdownQuery request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");
        var months = request.Months <= 0 ? 6 : request.Months;
        var from = DateTime.UtcNow.AddMonths(-months);

        var orders = await _orderRepo.WhereAsync(
            x => x.UserId == userId && x.Status == OrderStatus.Paid && x.CreatedAt >= from,
            ct);

        var wallet = await _walletRepo.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        var walletTransactions = wallet == null
            ? Array.Empty<WalletTransaction>()
            : await _walletTransactionRepo.WhereAsync(
                x => x.WalletId == wallet.Id && x.CreatedAt >= from,
                ct);

        var points = new List<(string Category, decimal Amount, DateTime Time)>();

        points.AddRange(orders.Select(o => ("Orders", o.TotalAmount, o.CreatedAt)));

        points.AddRange(walletTransactions
            .Where(x => x.Type == TransactionType.Payment)
            .Select(x => ("WalletPayment", Math.Abs(x.Amount), x.CreatedAt)));

        var grouped = points
            .GroupBy(x => new { x.Category, MonthYear = x.Time.ToString("yyyy-MM") })
            .Select(g => new
            {
                g.Key.Category,
                g.Key.MonthYear,
                Total = g.Sum(x => x.Amount)
            })
            .OrderBy(x => x.MonthYear)
            .ThenByDescending(x => x.Total)
            .ToList();

        var monthTotals = grouped
            .GroupBy(x => x.MonthYear)
            .ToDictionary(g => g.Key, g => g.Sum(x => x.Total));

        return grouped
            .Select(x => new SpendingCategoryDto(
                x.Category,
                x.Total,
                monthTotals[x.MonthYear] == 0m ? 0d : (double)(x.Total / monthTotals[x.MonthYear] * 100m),
                x.MonthYear))
            .ToList()
            .AsReadOnly();
    }
}
