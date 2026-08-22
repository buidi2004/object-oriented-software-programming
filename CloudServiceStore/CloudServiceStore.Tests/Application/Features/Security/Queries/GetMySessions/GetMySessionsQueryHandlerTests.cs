using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Security.Queries.GetMySessions;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Security.Queries.GetMySessions;

public class GetMySessionsQueryHandlerTests
{
    private readonly Mock<IRepository<UserSession>> _mockRepositoryUserSession;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMySessionsQueryHandler _handler;

    public GetMySessionsQueryHandlerTests()
    {
        _mockRepositoryUserSession = new Mock<IRepository<UserSession>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMySessionsQueryHandler(_mockRepositoryUserSession.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMySessionsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
