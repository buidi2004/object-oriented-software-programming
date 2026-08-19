using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Reports.Queries.GetSpendingBreakdown;

public record SpendingCategoryDto(
    string CategoryName,
    decimal TotalAmount,
    double Percentage,
    string MonthYear);

public record GetSpendingBreakdownQuery(int Months = 6) : IRequest<IReadOnlyList<SpendingCategoryDto>>;
