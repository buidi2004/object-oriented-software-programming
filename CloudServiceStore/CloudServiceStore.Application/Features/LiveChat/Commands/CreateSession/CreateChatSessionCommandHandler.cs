using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.LiveChat.Commands.CreateSession;

public class CreateChatSessionCommandHandler : IRequestHandler<CreateChatSessionCommand, Guid>
{
    private readonly IRepository<ChatSession> _chatRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateChatSessionCommandHandler(IRepository<ChatSession> chatRepository, IUnitOfWork unitOfWork)
    {
        _chatRepository = chatRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateChatSessionCommand request, CancellationToken cancellationToken)
    {
        var session = new ChatSession
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId ?? Guid.Empty,
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        };
        
        await _chatRepository.AddAsync(session);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return session.Id;
    }
}
