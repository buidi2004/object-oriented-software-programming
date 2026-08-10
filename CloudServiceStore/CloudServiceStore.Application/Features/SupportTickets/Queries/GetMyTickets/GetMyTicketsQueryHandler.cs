using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.SupportTickets.Queries.GetMyTickets;

public class GetMyTicketsQueryHandler : IRequestHandler<GetMyTicketsQuery, IEnumerable<SupportTicket>>
{
    private readonly IRepository<SupportTicket> _repository;
    private readonly ICurrentUserService _currentUserService;

    public GetMyTicketsQueryHandler(IRepository<SupportTicket> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<IEnumerable<SupportTicket>> Handle(GetMyTicketsQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUserService.UserId.HasValue)
            throw new System.UnauthorizedAccessException();

        return await _repository.WhereAsync(t => t.UserId == _currentUserService.UserId.Value, cancellationToken);
    }
}
