using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.SupportTickets.Commands.AssignTicket;

public class AssignTicketCommandHandler : IRequestHandler<AssignTicketCommand, bool>
{
    private readonly IRepository<SupportTicket> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public AssignTicketCommandHandler(IRepository<SupportTicket> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(AssignTicketCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(request.TicketId);
        if (ticket == null)
            return false;

        ticket.AssignStaff(request.StaffId);

        _repository.Update(ticket);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
