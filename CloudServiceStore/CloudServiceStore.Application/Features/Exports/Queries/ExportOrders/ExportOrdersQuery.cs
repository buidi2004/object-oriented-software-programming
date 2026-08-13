using MediatR;

namespace CloudServiceStore.Application.Features.Exports.Queries.ExportOrders;

public record ExportResultDto(string FileName, string ContentType, byte[] Data);

public record ExportOrdersQuery(string Format = "csv") : IRequest<ExportResultDto>;
