using System;
using Xunit;
using FluentAssertions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.DomainTests.Entities;

public class SupportTicketTests
{
    [Fact]
    public void AddMessage_WithAttachment_ShouldAddMessage()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var ticket = new SupportTicket(customerId, "Test Ticket", TicketPriority.High);
        
        var senderId = Guid.NewGuid();
        var message = "Test Message";
        var attachmentUrl = "/images/tickets/test.png";

        // Act
        ticket.AddMessage(senderId, message, attachmentUrl);

        // Assert
        ticket.Messages.Should().HaveCount(1);
        var addedMessage = System.Linq.Enumerable.First(ticket.Messages);
        addedMessage.Message.Should().Be(message);
        addedMessage.SenderId.Should().Be(senderId);
        addedMessage.AttachmentUrl.Should().Be(attachmentUrl);
    }
}
