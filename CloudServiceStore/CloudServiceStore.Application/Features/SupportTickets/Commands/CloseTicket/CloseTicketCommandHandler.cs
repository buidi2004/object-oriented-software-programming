using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.SupportTickets.Commands.CloseTicket;

public class CloseTicketCommandHandler : IRequestHandler<CloseTicketCommand, bool>
{
    private readonly IRepository<SupportTicket> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CloseTicketCommandHandler(IRepository<SupportTicket> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(CloseTicketCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(request.TicketId);
        if (ticket == null)
            return false;

        ticket.CloseTicket();

        _repository.Update(ticket);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
