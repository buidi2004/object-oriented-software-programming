using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.Domains.Queries.GetMyDomains;
public record GetMyDomainsQuery : IRequest<IEnumerable<DomainRecord>>;
