using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.SupportTickets.Queries.GetTicketById;

public class GetTicketByIdQueryHandler : IRequestHandler<GetTicketByIdQuery, SupportTicket?>
{
    private readonly IRepository<SupportTicket> _repository;

    public GetTicketByIdQueryHandler(IRepository<SupportTicket> repository)
    {
        _repository = repository;
    }

    public async Task<SupportTicket?> Handle(GetTicketByIdQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetByIdAsync(request.Id, cancellationToken);
    }
}
