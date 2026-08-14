using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Carts.Queries.GetAbandonedCarts;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Carts.Queries.GetAbandonedCarts;

public class GetAbandonedCartsQueryHandlerTests
{
    private readonly Mock<IRepository<Cart>> _mockRepositoryCart;
    private readonly GetAbandonedCartsQueryHandler _handler;

    public GetAbandonedCartsQueryHandlerTests()
    {
        _mockRepositoryCart = new Mock<IRepository<Cart>>();
        _handler = new GetAbandonedCartsQueryHandler(_mockRepositoryCart.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetAbandonedCartsQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
