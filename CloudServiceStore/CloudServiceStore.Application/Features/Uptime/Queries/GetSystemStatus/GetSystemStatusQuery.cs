using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.Uptime.Queries.GetSystemStatus;
public record GetSystemStatusQuery : IRequest<IEnumerable<ServiceStatusLog>>;
