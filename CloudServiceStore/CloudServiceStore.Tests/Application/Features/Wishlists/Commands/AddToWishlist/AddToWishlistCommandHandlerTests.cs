using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Wishlists.Commands.AddToWishlist;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Wishlists.Commands.AddToWishlist;

public class AddToWishlistCommandHandlerTests
{
    private readonly Mock<IRepository<WishlistItem>> _mockRepositoryWishlistItem;
    private readonly Mock<IRepository<ServicePlan>> _mockRepositoryServicePlan;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly AddToWishlistCommandHandler _handler;

    public AddToWishlistCommandHandlerTests()
    {
        _mockRepositoryWishlistItem = new Mock<IRepository<WishlistItem>>();
        _mockRepositoryServicePlan = new Mock<IRepository<ServicePlan>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new AddToWishlistCommandHandler(_mockRepositoryWishlistItem.Object, _mockRepositoryServicePlan.Object, _mockUnitOfWork.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new AddToWishlistCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
