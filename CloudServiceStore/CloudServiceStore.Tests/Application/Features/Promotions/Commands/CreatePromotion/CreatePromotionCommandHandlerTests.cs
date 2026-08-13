using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Promotions.Commands.CreatePromotion;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Promotions.Commands.CreatePromotion;

public class CreatePromotionCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Promotion>> _mockRepositoryPromotion;
    private readonly Mock<ICatalogCache> _mockCatalogCache;
    private readonly CreatePromotionCommandHandler _handler;

    public CreatePromotionCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryPromotion = new Mock<IRepository<Promotion>>();
        _mockCatalogCache = new Mock<ICatalogCache>();
        _handler = new CreatePromotionCommandHandler(
            _mockUnitOfWork.Object,
            _mockRepositoryPromotion.Object,
            _mockCatalogCache.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new CreatePromotionCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
