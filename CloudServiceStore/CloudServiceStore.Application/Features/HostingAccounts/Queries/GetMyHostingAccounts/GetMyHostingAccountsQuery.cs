using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.HostingAccounts.Queries.GetMyHostingAccounts;

public record GetMyHostingAccountsQuery() : IRequest<IEnumerable<HostingAccountDto>>;
