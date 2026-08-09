using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ExchangeRates.Commands.UpsertExchangeRate;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.ExchangeRates;

public class UpsertExchangeRateCommandHandlerTests
{
    private readonly Mock<IRepository<ExchangeRate>> _rateRepoMock = new();
    private readonly Mock<IUnitOfWork> _unitOfWorkMock = new();

    private UpsertExchangeRateCommandHandler CreateHandler()
        => new(_rateRepoMock.Object, _unitOfWorkMock.Object);

    [Fact]
    public async Task Handle_NewCurrencyPair_CreatesNewExchangeRate()
    {
        _rateRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ExchangeRate, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<ExchangeRate, object>>[]>()))
            .ReturnsAsync((ExchangeRate?)null); // Does not exist yet

        var command = new UpsertExchangeRateCommand { FromCurrency = "VND", ToCurrency = "USD", Rate = 1m / 25000m };
        var handler = CreateHandler();

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result);
        _rateRepoMock.Verify(r => r.AddAsync(It.Is<ExchangeRate>(x => x.FromCurrency == "VND" && x.ToCurrency == "USD"), It.IsAny<CancellationToken>()), Times.Once);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ExistingCurrencyPair_UpdatesRate()
    {
        var existing = new ExchangeRate { Id = Guid.NewGuid(), FromCurrency = "VND", ToCurrency = "USD", Rate = 1m / 23000m, UpdatedAt = DateTime.UtcNow.AddDays(-1) };
        _rateRepoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<ExchangeRate, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<ExchangeRate, object>>[]>()))
            .ReturnsAsync(existing);

        var command = new UpsertExchangeRateCommand { FromCurrency = "VND", ToCurrency = "USD", Rate = 1m / 25000m };
        var handler = CreateHandler();

        var result = await handler.Handle(command, CancellationToken.None);

        Assert.True(result);
        _rateRepoMock.Verify(r => r.Update(It.Is<ExchangeRate>(x => x.Rate == 1m / 25000m)), Times.Once);
        _rateRepoMock.Verify(r => r.AddAsync(It.IsAny<ExchangeRate>(), It.IsAny<CancellationToken>()), Times.Never);
        _unitOfWorkMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
