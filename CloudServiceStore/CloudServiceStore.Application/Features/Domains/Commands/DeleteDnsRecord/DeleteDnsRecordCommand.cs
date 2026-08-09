using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Commands.DeleteDnsRecord;
public record DeleteDnsRecordCommand(Guid DomainId, Guid RecordId) : IRequest;
