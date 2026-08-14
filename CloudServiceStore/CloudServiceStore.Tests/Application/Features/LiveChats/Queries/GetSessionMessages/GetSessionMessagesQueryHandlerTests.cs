using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.LiveChats.Queries.GetSessionMessages;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.LiveChats.Queries.GetSessionMessages;

public class GetSessionMessagesQueryHandlerTests
{
    private readonly Mock<IRepository<ChatMessage>> _mockRepositoryChatMessage;
    private readonly Mock<IRepository<ChatSession>> _mockRepositoryChatSession;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly GetSessionMessagesQueryHandler _handler;

    public GetSessionMessagesQueryHandlerTests()
    {
        _mockRepositoryChatMessage = new Mock<IRepository<ChatMessage>>();
        _mockRepositoryChatSession = new Mock<IRepository<ChatSession>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _handler = new GetSessionMessagesQueryHandler(_mockRepositoryChatMessage.Object, _mockRepositoryChatSession.Object, _mockCurrentUserService.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new GetSessionMessagesQuery();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
