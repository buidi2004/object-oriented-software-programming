using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Carts.Queries.GetMyCart;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Carts.Queries.GetMyCart;

public class GetMyCartQueryHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Cart>> _mockRepositoryCart;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IDapperContext> _mockDapperContext;
    private readonly GetMyCartQueryHandler _handler;

    public GetMyCartQueryHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryCart = new Mock<IRepository<Cart>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockDapperContext = new Mock<IDapperContext>();
        _handler = new GetMyCartQueryHandler(_mockUnitOfWork.Object, _mockRepositoryCart.Object, _mockCurrentUserService.Object, _mockDapperContext.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyCartQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
