using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using CloudServiceStore.Application.Features.LiveChats.Notifications;

namespace CloudServiceStore.Application.Features.LiveChats.Commands.SendChatMessage;

public class SendChatMessageCommandHandler : IRequestHandler<SendChatMessageCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<ChatMessage> _msgRepo;
    private readonly IRepository<ChatSession> _sessionRepo;
    private readonly ICurrentUserService _currentUser;
    private readonly IPublisher _publisher;

    public SendChatMessageCommandHandler(
        IUnitOfWork uow, 
        IRepository<ChatMessage> msgRepo, 
        IRepository<ChatSession> sessionRepo, 
        ICurrentUserService currentUser,
        IPublisher publisher)
    {
        _uow = uow;
        _msgRepo = msgRepo;
        _sessionRepo = sessionRepo;
        _currentUser = currentUser;
        _publisher = publisher;
    }

    public async Task<Guid> Handle(SendChatMessageCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Unauthorized");

        var session = await _sessionRepo.GetByIdAsync(request.SessionId, ct)
            ?? throw new NotFoundException("Chat session not found");

        if (session.Status == "Closed")
            throw new BadRequestException("Cannot send message to a closed chat session");

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = request.SessionId,
            SenderId = userId,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        await _msgRepo.AddAsync(message, ct);
        await _uow.SaveChangesAsync(ct);

        // Publish notification so WebApi can pick it up and broadcast via SignalR
        await _publisher.Publish(new ChatMessageSentNotification(
            message.Id,
            message.SessionId,
            message.SenderId,
            message.Message,
            message.CreatedAt
        ), ct);

        return message.Id;
    }
}
