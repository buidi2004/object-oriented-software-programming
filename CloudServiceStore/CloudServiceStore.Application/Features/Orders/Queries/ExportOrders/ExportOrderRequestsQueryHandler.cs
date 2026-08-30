using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ClosedXML.Excel;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Features.Orders.Queries.ExportOrders;

public class ExportOrderRequestsQueryHandler : IRequestHandler<ExportOrderRequestsQuery, byte[]>
{
    private readonly IRepository<OrderRequest> _orderRepo;

    public ExportOrderRequestsQueryHandler(IRepository<OrderRequest> orderRepo)
    {
        _orderRepo = orderRepo;
    }

    public async Task<byte[]> Handle(ExportOrderRequestsQuery request, CancellationToken cancellationToken)
    {
        var orders = await _orderRepo.GetAllAsync(cancellationToken);

        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Orders");

        // Headers
        worksheet.Cell(1, 1).Value = "Mã đơn hàng";
        worksheet.Cell(1, 2).Value = "Khách hàng (ID)";
        worksheet.Cell(1, 3).Value = "Trạng thái";
        worksheet.Cell(1, 4).Value = "Tổng tiền";
        worksheet.Cell(1, 5).Value = "Ngày tạo";

        // Styling headers
        var headerRow = worksheet.Row(1);
        headerRow.Style.Font.Bold = true;
        headerRow.Style.Fill.BackgroundColor = XLColor.LightGray;

        // Data
        int row = 2;
        foreach (var order in orders.OrderByDescending(o => o.CreatedAt))
        {
            worksheet.Cell(row, 1).Value = order.Id.ToString();
            worksheet.Cell(row, 2).Value = order.UserId.ToString();
            worksheet.Cell(row, 3).Value = order.Status.ToString();
            worksheet.Cell(row, 4).Value = order.TotalAmount;
            worksheet.Cell(row, 5).Value = order.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss");
            row++;
        }

        worksheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }
}
