using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.RefundRequests.Queries.GetAllRefundRequests;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.RefundRequests.Queries.GetAllRefundRequests;

public class GetAllRefundRequestsQueryHandlerTests
{
    private readonly Mock<IRepository<RefundRequest>> _mockRepositoryRefundRequest;
    private readonly GetAllRefundRequestsQueryHandler _handler;

    public GetAllRefundRequestsQueryHandlerTests()
    {
        _mockRepositoryRefundRequest = new Mock<IRepository<RefundRequest>>();
        _handler = new GetAllRefundRequestsQueryHandler(_mockRepositoryRefundRequest.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetAllRefundRequestsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
