using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.LiveChat.Commands.SendMessage;

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Guid>
{
    private readonly IRepository<ChatMessage> _messageRepository;
    private readonly IRepository<ChatSession> _sessionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public SendMessageCommandHandler(IRepository<ChatMessage> messageRepository, IRepository<ChatSession> sessionRepository, IUnitOfWork unitOfWork)
    {
        _messageRepository = messageRepository;
        _sessionRepository = sessionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        var session = await _sessionRepository.GetByIdAsync(request.ChatSessionId);
        if (session == null)
            throw new ArgumentException("Chat session not found.", nameof(request.ChatSessionId));

        if (session.Status == "Closed")
            throw new InvalidOperationException("Cannot send message to a closed chat session.");

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            SessionId = request.ChatSessionId,
            SenderId = request.SenderId ?? Guid.Empty,
            Message = request.Content,
            CreatedAt = DateTime.UtcNow
        };
        
        await _messageRepository.AddAsync(message);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return message.Id;
    }
}
