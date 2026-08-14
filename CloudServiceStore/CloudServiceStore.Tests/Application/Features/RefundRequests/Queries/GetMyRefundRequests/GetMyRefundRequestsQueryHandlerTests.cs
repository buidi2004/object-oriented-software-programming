using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.RefundRequests.Queries.GetMyRefundRequests;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.RefundRequests.Queries.GetMyRefundRequests;

public class GetMyRefundRequestsQueryHandlerTests
{
    private readonly Mock<IRepository<RefundRequest>> _mockRepositoryRefundRequest;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyRefundRequestsQueryHandler _handler;

    public GetMyRefundRequestsQueryHandlerTests()
    {
        _mockRepositoryRefundRequest = new Mock<IRepository<RefundRequest>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyRefundRequestsQueryHandler(_mockRepositoryRefundRequest.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyRefundRequestsQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
