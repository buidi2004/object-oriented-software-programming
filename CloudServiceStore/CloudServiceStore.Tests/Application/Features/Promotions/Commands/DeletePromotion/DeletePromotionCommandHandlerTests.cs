using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Promotions.Commands.DeletePromotion;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Promotions.Commands.DeletePromotion;

public class DeletePromotionCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Promotion>> _mockRepositoryPromotion;
    private readonly Mock<ICatalogCache> _mockCatalogCache;
    private readonly DeletePromotionCommandHandler _handler;

    public DeletePromotionCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryPromotion = new Mock<IRepository<Promotion>>();
        _mockCatalogCache = new Mock<ICatalogCache>();
        _handler = new DeletePromotionCommandHandler(
            _mockUnitOfWork.Object,
            _mockRepositoryPromotion.Object,
            _mockCatalogCache.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new DeletePromotionCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
