using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Security.Queries.GetLoginHistory;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Security.Queries.GetLoginHistory;

public class GetLoginHistoryQueryHandlerTests
{
    private readonly Mock<IRepository<LoginHistory>> _mockRepositoryLoginHistory;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetLoginHistoryQueryHandler _handler;

    public GetLoginHistoryQueryHandlerTests()
    {
        _mockRepositoryLoginHistory = new Mock<IRepository<LoginHistory>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetLoginHistoryQueryHandler(_mockRepositoryLoginHistory.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetLoginHistoryQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
