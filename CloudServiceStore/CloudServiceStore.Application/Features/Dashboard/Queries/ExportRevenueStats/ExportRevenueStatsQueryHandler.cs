using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using MediatR;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Dashboard.Queries.ExportRevenueStats;

public class ExportRevenueStatsQueryHandler : IRequestHandler<ExportRevenueStatsQuery, byte[]>
{
    private readonly IRepository<OrderRequest> _repository;

    public ExportRevenueStatsQueryHandler(IRepository<OrderRequest> repository)
    {
        _repository = repository;
    }

    public async Task<byte[]> Handle(ExportRevenueStatsQuery request, CancellationToken cancellationToken)
    {
        var orders = await _repository.WhereAsync(o => o.Status == OrderStatus.Paid, cancellationToken);
        
        var sb = new StringBuilder();
        sb.AppendLine("OrderId,UserId,TotalAmount,CreatedAt");
        
        foreach (var order in orders)
        {
            sb.AppendLine($"{order.Id},{order.UserId},{order.TotalAmount},{order.CreatedAt:yyyy-MM-dd HH:mm:ss}");
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }
}
