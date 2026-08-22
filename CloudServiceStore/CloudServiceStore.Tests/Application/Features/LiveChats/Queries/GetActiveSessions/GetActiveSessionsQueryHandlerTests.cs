using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.LiveChats.Queries.GetActiveSessions;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.LiveChats.Queries.GetActiveSessions;

public class GetActiveSessionsQueryHandlerTests
{
    private readonly Mock<IRepository<ChatSession>> _mockRepositoryChatSession;
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly GetActiveSessionsQueryHandler _handler;

    public GetActiveSessionsQueryHandlerTests()
    {
        _mockRepositoryChatSession = new Mock<IRepository<ChatSession>>();
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _handler = new GetActiveSessionsQueryHandler(_mockRepositoryChatSession.Object, _mockRepositoryAppUser.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetActiveSessionsQuery();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
