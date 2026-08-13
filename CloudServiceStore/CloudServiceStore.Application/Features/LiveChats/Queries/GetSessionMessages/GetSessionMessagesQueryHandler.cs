using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Queries.GetSessionMessages;

public class GetSessionMessagesQueryHandler : IRequestHandler<GetSessionMessagesQuery, IReadOnlyList<ChatMessageDto>>
{
    private readonly IRepository<ChatMessage> _msgRepo;
    private readonly IRepository<ChatSession> _sessionRepo;
    private readonly ICurrentUserService _currentUser;

    public GetSessionMessagesQueryHandler(IRepository<ChatMessage> msgRepo, IRepository<ChatSession> sessionRepo, ICurrentUserService currentUser)
    {
        _msgRepo = msgRepo;
        _sessionRepo = sessionRepo;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<ChatMessageDto>> Handle(GetSessionMessagesQuery request, CancellationToken ct)
    {
        var session = await _sessionRepo.GetByIdAsync(request.SessionId, ct)
            ?? throw new NotFoundException("Chat session not found");

        var isOwner = session.UserId == _currentUser.UserId;
        var isAdmin = _currentUser.IsInRole("Admin");
        if (!isOwner && !isAdmin)
            throw new UnauthorizedException("Unauthorized");

        var messages = await _msgRepo.WhereAsync(m => m.SessionId == request.SessionId, ct);
        
        return messages.OrderBy(m => m.CreatedAt)
            .Select(m => new ChatMessageDto(m.Id, m.SenderId, m.Message, m.CreatedAt))
            .ToList().AsReadOnly();
    }
}
