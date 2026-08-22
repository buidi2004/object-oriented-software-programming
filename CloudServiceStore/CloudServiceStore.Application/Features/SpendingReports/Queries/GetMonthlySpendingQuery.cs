using MediatR;
using CloudServiceStore.Application.Features.SpendingReports.DTOs;

namespace CloudServiceStore.Application.Features.SpendingReports.Queries;

public record GetMonthlySpendingQuery(int Month, int Year, Guid UserId) : IRequest<MonthlySpendingDto>;

public class GetMonthlySpendingQueryHandler : IRequestHandler<GetMonthlySpendingQuery, MonthlySpendingDto>
{
    public async Task<MonthlySpendingDto> Handle(GetMonthlySpendingQuery request, CancellationToken cancellationToken)
    {
        var result = new MonthlySpendingDto
        {
            Month = request.Month,
            Year = request.Year,
            TotalAmount = 1250000,
            Breakdown = new List<SpendingBreakdownDto>
            {
                new() { Category = "VPS", Amount = 600000, Color = "#3b82f6" },
                new() { Category = "Domain", Amount = 250000, Color = "#22c55e" },
                new() { Category = "Hosting", Amount = 200000, Color = "#f59e0b" },
                new() { Category = "SSL", Amount = 100000, Color = "#a855f7" },
                new() { Category = "Khác", Amount = 100000, Color = "#94a3b8" }
            }
        };
        await Task.CompletedTask;
        return result;
    }
}
