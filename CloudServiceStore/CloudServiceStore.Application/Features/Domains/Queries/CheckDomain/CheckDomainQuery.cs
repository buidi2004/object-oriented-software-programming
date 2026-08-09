using MediatR;
namespace CloudServiceStore.Application.Features.Domains.Queries.CheckDomain;
public record CheckDomainQuery(string DomainName) : IRequest<bool>;
