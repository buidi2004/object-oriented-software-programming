using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.CloseTicket;

public class CloseTicketCommandHandler : IRequestHandler<CloseTicketCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly ICurrentUserService _currentUser;

    public CloseTicketCommandHandler(
        IUnitOfWork uow,
        IRepository<SupportTicket> ticketRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _ticketRepo = ticketRepo;
        _currentUser = currentUser;
    }

    public async Task Handle(CloseTicketCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var ticket = await _ticketRepo.GetByIdAsync(request.TicketId, ct)
            ?? throw new NotFoundException($"Ticket {request.TicketId} không tồn tại.");

        ticket.CloseTicket(); // Domain logic — idempotent if already closed
        await _uow.SaveChangesAsync(ct);
    }
}
