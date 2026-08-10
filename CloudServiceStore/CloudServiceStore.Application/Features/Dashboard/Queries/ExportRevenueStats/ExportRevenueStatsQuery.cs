using MediatR;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.ExportRevenueStats;

public class ExportRevenueStatsQuery : IRequest<byte[]>
{
    public string Format { get; set; } = "csv";

    public ExportRevenueStatsQuery(string format)
    {
        Format = format.ToLower();
    }
}
