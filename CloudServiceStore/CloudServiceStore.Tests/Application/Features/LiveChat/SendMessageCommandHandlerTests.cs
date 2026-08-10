using CloudServiceStore.Application.Features.LiveChat.Commands.SendMessage;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Tests.Application.Features.LiveChat;

public class SendMessageCommandHandlerTests
{
    private readonly Mock<IRepository<ChatMessage>> _messageRepositoryMock;
    private readonly Mock<IRepository<ChatSession>> _sessionRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly SendMessageCommandHandler _handler;

    public SendMessageCommandHandlerTests()
    {
        _messageRepositoryMock = new Mock<IRepository<ChatMessage>>();
        _sessionRepositoryMock = new Mock<IRepository<ChatSession>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _handler = new SendMessageCommandHandler(_messageRepositoryMock.Object, _sessionRepositoryMock.Object, _unitOfWorkMock.Object);
    }

    [Fact]
    public async Task Handle_ValidMessage_ShouldSendMessageAndReturnId()
    {
        // Arrange
        var sessionId = Guid.NewGuid();
        var session = new ChatSession(null, "Guest");
        // We need to set Id using reflection or use the setup correctly since Id is init/private set, but we mock the repo
        
        _sessionRepositoryMock.Setup(x => x.GetByIdAsync(sessionId)).ReturnsAsync(session);

        var command = new SendMessageCommand(sessionId, null, "Guest", "Hello!");

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
        
        _messageRepositoryMock.Verify(x => x.AddAsync(It.Is<ChatMessage>(m => 
            m.ChatSessionId == sessionId &&
            m.Content == "Hello!" &&
            m.SenderName == "Guest")), Times.Once);

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ClosedSession_ShouldThrowException()
    {
        // Arrange
        var sessionId = Guid.NewGuid();
        var session = new ChatSession(null, "Guest");
        session.Close(); // Set status to Closed
        
        _sessionRepositoryMock.Setup(x => x.GetByIdAsync(sessionId)).ReturnsAsync(session);

        var command = new SendMessageCommand(sessionId, null, "Guest", "Hello!");

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _handler.Handle(command, CancellationToken.None));
    }
}
