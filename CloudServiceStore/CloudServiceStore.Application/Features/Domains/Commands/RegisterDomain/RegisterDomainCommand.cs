using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Domains.Commands.RegisterDomain;
public record RegisterDomainCommand(string DomainName, Guid OrderRequestId) : IRequest<Guid>;
