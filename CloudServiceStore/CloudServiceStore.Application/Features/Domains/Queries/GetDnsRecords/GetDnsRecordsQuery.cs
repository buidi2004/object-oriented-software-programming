using System;
using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.Domains.Queries.GetDnsRecords;
public record GetDnsRecordsQuery(Guid DomainId) : IRequest<IEnumerable<DnsRecord>>;
