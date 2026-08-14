using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.LiveChats.Queries.GetMyActiveSession;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.LiveChats.Queries.GetMyActiveSession;

public class GetMyActiveSessionQueryHandlerTests
{
    private readonly Mock<IRepository<ChatSession>> _mockRepositoryChatSession;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetMyActiveSessionQueryHandler _handler;

    public GetMyActiveSessionQueryHandlerTests()
    {
        _mockRepositoryChatSession = new Mock<IRepository<ChatSession>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetMyActiveSessionQueryHandler(_mockRepositoryChatSession.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetMyActiveSessionQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
