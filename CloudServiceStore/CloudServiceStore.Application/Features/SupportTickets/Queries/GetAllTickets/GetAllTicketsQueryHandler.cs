using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.SupportTickets.Queries.GetAllTickets;

public class GetAllTicketsQueryHandler : IRequestHandler<GetAllTicketsQuery, IEnumerable<SupportTicket>>
{
    private readonly IRepository<SupportTicket> _repository;

    public GetAllTicketsQueryHandler(IRepository<SupportTicket> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<SupportTicket>> Handle(GetAllTicketsQuery request, CancellationToken cancellationToken)
    {
        return await _repository.GetAllAsync(cancellationToken);
    }
}
