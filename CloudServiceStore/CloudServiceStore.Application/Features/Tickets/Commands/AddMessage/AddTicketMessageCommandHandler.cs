using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.AddMessage;

public class AddTicketMessageCommandHandler : IRequestHandler<AddTicketMessageCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly IRepository<TicketMessage> _messageRepo;
    private readonly ICurrentUserService _currentUser;

    public AddTicketMessageCommandHandler(
        IUnitOfWork uow,
        IRepository<SupportTicket> ticketRepo,
        IRepository<TicketMessage> messageRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _ticketRepo = ticketRepo;
        _messageRepo = messageRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddTicketMessageCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var ticket = await _ticketRepo.GetByIdAsync(request.TicketId, ct)
            ?? throw new NotFoundException($"Ticket {request.TicketId} không tồn tại.");

        ticket.AddMessage(userId, request.Message); // Domain logic throws if closed
        
        var message = ticket.Messages.Last();
        await _messageRepo.AddAsync(message, ct);

        await _uow.SaveChangesAsync(ct);

        return message.Id;
    }
}
