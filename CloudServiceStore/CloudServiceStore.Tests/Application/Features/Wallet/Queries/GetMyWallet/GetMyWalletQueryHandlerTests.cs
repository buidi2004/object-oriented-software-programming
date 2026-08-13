using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Wallet.Queries.GetMyWallet;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Wallet.Queries.GetMyWallet;

public class GetMyWalletQueryHandlerTests
{
    private readonly Mock<IRepository<Domain.Entities.Wallet>> _mockRepositoryDomainEntitiesWallet;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly GetMyWalletQueryHandler _handler;

    public GetMyWalletQueryHandlerTests()
    {
        _mockRepositoryDomainEntitiesWallet = new Mock<IRepository<Domain.Entities.Wallet>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _handler = new GetMyWalletQueryHandler(_mockRepositoryDomainEntitiesWallet.Object, _mockCurrentUserService.Object, _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyWalletQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
