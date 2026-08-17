using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.SupportTickets.Queries.GetTicketById;

public class GetTicketByIdQueryHandler : IRequestHandler<GetTicketByIdQuery, SupportTicket?>
{
    private readonly IRepository<SupportTicket> _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetTicketByIdQueryHandler(IRepository<SupportTicket> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<SupportTicket?> Handle(GetTicketByIdQuery request, CancellationToken cancellationToken)
    {
        var ticket = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (ticket == null) return null;

        if (_currentUserService.UserId.HasValue 
            && ticket.UserId != _currentUserService.UserId.Value 
            && !_currentUserService.IsInRole("Admin"))
        {
            return null;
        }

        return ticket;
    }
}
