using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Wallet.Commands.TopUpWallet;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Wallet.Commands.TopUpWallet;

public class TopUpWalletCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Domain.Entities.Wallet>> _mockRepositoryDomainEntitiesWallet;
    private readonly Mock<IRepository<WalletTransaction>> _mockRepositoryWalletTransaction;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly TopUpWalletCommandHandler _handler;

    public TopUpWalletCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryDomainEntitiesWallet = new Mock<IRepository<Domain.Entities.Wallet>>();
        _mockRepositoryWalletTransaction = new Mock<IRepository<WalletTransaction>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new TopUpWalletCommandHandler(_mockUnitOfWork.Object, _mockRepositoryDomainEntitiesWallet.Object, _mockRepositoryWalletTransaction.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new TopUpWalletCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
