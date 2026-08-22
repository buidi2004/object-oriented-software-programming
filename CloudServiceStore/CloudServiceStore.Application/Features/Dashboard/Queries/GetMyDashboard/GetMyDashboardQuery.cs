using System;
using MediatR;

using System.Collections.Generic;
namespace CloudServiceStore.Application.Features.Dashboard.Queries.GetMyDashboard;

public record ActiveServiceDto(Guid Id, string Name, string Status, string Ip, string Os, string Cpu, string Ram, int UptimeDays, string CategorySlug);

public record CustomerDashboardDto(int TotalOrders, decimal TotalSpent, List<ActiveServiceDto> ActiveServices);

public record GetMyDashboardQuery() : IRequest<CustomerDashboardDto>;
