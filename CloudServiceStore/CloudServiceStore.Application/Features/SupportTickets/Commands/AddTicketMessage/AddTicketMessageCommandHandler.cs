using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.SupportTickets.Commands.AddTicketMessage;

public class AddTicketMessageCommandHandler : IRequestHandler<AddTicketMessageCommand, bool>
{
    private readonly IRepository<SupportTicket> _repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;

    public AddTicketMessageCommandHandler(IRepository<SupportTicket> repository, IUnitOfWork unitOfWork, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
    }

    public async Task<bool> Handle(AddTicketMessageCommand request, CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(request.TicketId);
        if (ticket == null)
            return false;

        if (!_currentUserService.UserId.HasValue)
            throw new UnauthorizedAccessException();

        ticket.AddMessage(_currentUserService.UserId.Value, request.Message);

        _repository.Update(ticket);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }
}
