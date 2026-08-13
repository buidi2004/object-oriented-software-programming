using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.CreateTicket;

public class CreateTicketCommandHandler : IRequestHandler<CreateTicketCommand, Guid>
{
    private readonly IUnitOfWork _uow;
    private readonly IRepository<SupportTicket> _ticketRepo;
    private readonly ICurrentUserService _currentUser;

    public CreateTicketCommandHandler(
        IUnitOfWork uow,
        IRepository<SupportTicket> ticketRepo,
        ICurrentUserService currentUser)
    {
        _uow = uow;
        _ticketRepo = ticketRepo;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateTicketCommand request, CancellationToken ct)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedException("Người dùng chưa đăng nhập.");

        var ticket = new SupportTicket(userId, request.Subject, request.Priority);
        await _ticketRepo.AddAsync(ticket, ct);
        await _uow.SaveChangesAsync(ct);

        return ticket.Id;
    }
}
