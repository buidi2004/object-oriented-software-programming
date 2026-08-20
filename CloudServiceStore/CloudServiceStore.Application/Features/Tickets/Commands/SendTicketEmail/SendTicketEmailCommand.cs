using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Commands.SendTicketEmail;

public class SendTicketEmailCommand : IRequest<bool>
{
    public Guid TicketId { get; set; }
    public string Subject { get; set; } = null!;
    public string HtmlBody { get; set; } = null!;

    public SendTicketEmailCommand(Guid ticketId, string subject, string htmlBody)
    {
        TicketId = ticketId;
        Subject = subject;
        HtmlBody = htmlBody;
    }
}
