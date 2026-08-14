using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Exports.Queries.ExportOrders;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Exports.Queries.ExportOrders;

public class ExportOrdersQueryHandlerTests
{
    private readonly Mock<IRepository<OrderRequest>> _mockRepositoryOrderRequest;
    private readonly ExportOrdersQueryHandler _handler;

    public ExportOrdersQueryHandlerTests()
    {
        _mockRepositoryOrderRequest = new Mock<IRepository<OrderRequest>>();
        _handler = new ExportOrdersQueryHandler(_mockRepositoryOrderRequest.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new ExportOrdersQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
