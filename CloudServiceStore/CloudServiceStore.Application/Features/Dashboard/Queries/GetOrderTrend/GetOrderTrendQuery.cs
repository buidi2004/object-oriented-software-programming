using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.GetOrderTrend;

public record OrderTrendItemDto(DateTime Date, int OrderCount);
public record GetOrderTrendQuery(DateTime StartDate, DateTime EndDate) : IRequest<IReadOnlyList<OrderTrendItemDto>>;
