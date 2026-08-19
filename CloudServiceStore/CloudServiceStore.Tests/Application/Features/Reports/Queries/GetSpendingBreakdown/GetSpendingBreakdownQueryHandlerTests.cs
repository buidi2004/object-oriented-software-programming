using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Reports.Queries.GetSpendingBreakdown;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Reports.Queries.GetSpendingBreakdown;

public class GetSpendingBreakdownQueryHandlerTests
{
    [Fact]
    public async Task Handle_ShouldAggregateByMonthAndCategory()
    {
        var userId = Guid.NewGuid();
        var wallet = new Wallet(userId);
        var walletId = wallet.Id;

        var orderRepo = new Mock<IRepository<OrderRequest>>();
        var walletRepo = new Mock<IRepository<Wallet>>();
        var walletTxRepo = new Mock<IRepository<WalletTransaction>>();
        var currentUser = new Mock<ICurrentUserService>();

        currentUser.Setup(x => x.UserId).Returns(userId);

        var order = new OrderRequest(userId, new List<OrderItem>(), null, 0m, 200_000m);
        order.Pay();

        orderRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<OrderRequest, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<OrderRequest> { order });

        walletRepo.Setup(x => x.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<Wallet, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(wallet);

        walletTxRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<WalletTransaction, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<WalletTransaction>
            {
                new(walletId, 100_000m, TransactionType.Payment)
            });

        var handler = new GetSpendingBreakdownQueryHandler(orderRepo.Object, walletRepo.Object, walletTxRepo.Object, currentUser.Object);

        var result = await handler.Handle(new GetSpendingBreakdownQuery(6), CancellationToken.None);

        result.Should().NotBeEmpty();
    }
}
