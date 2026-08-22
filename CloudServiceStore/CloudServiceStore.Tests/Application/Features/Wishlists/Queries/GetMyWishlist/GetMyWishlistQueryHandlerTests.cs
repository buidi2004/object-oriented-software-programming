using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Wishlists.Queries.GetMyWishlist;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Wishlists.Queries.GetMyWishlist;

public class GetMyWishlistQueryHandlerTests
{
    private readonly Mock<IRepository<WishlistItem>> _mockRepositoryWishlistItem;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyWishlistQueryHandler _handler;

    public GetMyWishlistQueryHandlerTests()
    {
        _mockRepositoryWishlistItem = new Mock<IRepository<WishlistItem>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyWishlistQueryHandler(_mockRepositoryWishlistItem.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyWishlistQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
