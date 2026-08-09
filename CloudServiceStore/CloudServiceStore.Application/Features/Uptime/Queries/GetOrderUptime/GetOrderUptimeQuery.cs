using System;
using System.Collections.Generic;
using MediatR;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Application.Features.Uptime.Queries.GetOrderUptime;
public record GetOrderUptimeQuery(Guid OrderId) : IRequest<IEnumerable<ServiceStatusLog>>;
