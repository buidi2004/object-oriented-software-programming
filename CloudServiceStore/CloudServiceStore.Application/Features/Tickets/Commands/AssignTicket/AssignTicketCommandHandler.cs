using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.AssignTicket;

public class AssignTicketCommandHandler : IRequestHandler<AssignTicketCommand>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SupportTicket> _ticketRepo;

    public AssignTicketCommandHandler(
        IUnitOfWork uow,
        IRepository<SupportTicket> ticketRepo)
    {
        _uow = uow;
        _ticketRepo = ticketRepo;
    }

    public async Task Handle(AssignTicketCommand request, CancellationToken ct)
    {
        var ticket = await _ticketRepo.GetByIdAsync(request.TicketId, ct)
            ?? throw new NotFoundException($"Ticket {request.TicketId} không tồn tại.");

        ticket.AssignStaff(request.StaffId); // Domain logic throws if closed
        await _uow.SaveChangesAsync(ct);
    }
}
