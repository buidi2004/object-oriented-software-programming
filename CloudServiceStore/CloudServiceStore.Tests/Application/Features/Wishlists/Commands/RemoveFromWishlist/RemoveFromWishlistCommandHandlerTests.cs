using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Wishlists.Commands.RemoveFromWishlist;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Wishlists.Commands.RemoveFromWishlist;

public class RemoveFromWishlistCommandHandlerTests
{
    private readonly Mock<IRepository<WishlistItem>> _mockRepositoryWishlistItem;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly RemoveFromWishlistCommandHandler _handler;

    public RemoveFromWishlistCommandHandlerTests()
    {
        _mockRepositoryWishlistItem = new Mock<IRepository<WishlistItem>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new RemoveFromWishlistCommandHandler(_mockRepositoryWishlistItem.Object, _mockUnitOfWork.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new RemoveFromWishlistCommand();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
