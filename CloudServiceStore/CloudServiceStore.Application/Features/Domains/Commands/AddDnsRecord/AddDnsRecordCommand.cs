using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Commands.AddDnsRecord;
public record AddDnsRecordCommand(Guid DomainId, string Type, string Name, string Value, int TTL) : IRequest<Guid>;
