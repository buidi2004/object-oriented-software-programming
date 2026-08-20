using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.SendTicketEmail;

public class SendTicketEmailCommandHandler : IRequestHandler<SendTicketEmailCommand, bool>
{
    private readonly IRepository<SupportTicket> _ticketRepository;
    private readonly IRepository<AppUser> _userRepository;
    private readonly IEmailService _emailService;

    public SendTicketEmailCommandHandler(
        IRepository<SupportTicket> ticketRepository, 
        IRepository<AppUser> userRepository,
        IEmailService emailService)
    {
        _ticketRepository = ticketRepository;
        _userRepository = userRepository;
        _emailService = emailService;
    }

    public async Task<bool> Handle(SendTicketEmailCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _ticketRepository.GetByIdAsync(request.TicketId, cancellationToken);
        if (ticket == null)
        {
            throw new Exception($"Không tìm thấy ticket với ID {request.TicketId}");
        }

        var user = await _userRepository.GetByIdAsync(ticket.UserId, cancellationToken);
        if (user == null)
        {
            throw new Exception($"Không tìm thấy user của ticket {request.TicketId}");
        }

        await _emailService.SendEmailAsync(user.Email, request.Subject, request.HtmlBody, cancellationToken);

        return true;
    }
}
