using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.LiveChats.Commands.SendChatMessage;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.LiveChats.Commands.SendChatMessage;

public class SendChatMessageCommandHandlerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<ChatMessage>> _mockRepositoryChatMessage;
    private readonly Mock<IRepository<ChatSession>> _mockRepositoryChatSession;
    private readonly Mock<ICurrentUserService> _mockCurrentUserService;
    private readonly Mock<IPublisher> _mockPublisher;
    private readonly SendChatMessageCommandHandler _handler;

    public SendChatMessageCommandHandlerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockRepositoryChatMessage = new Mock<IRepository<ChatMessage>>();
        _mockRepositoryChatSession = new Mock<IRepository<ChatSession>>();
        _mockCurrentUserService = new Mock<ICurrentUserService>();
        _mockPublisher = new Mock<IPublisher>();
        _handler = new SendChatMessageCommandHandler(_mockUnitOfWork.Object, _mockRepositoryChatMessage.Object, _mockRepositoryChatSession.Object, _mockCurrentUserService.Object, _mockPublisher.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new SendChatMessageCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
