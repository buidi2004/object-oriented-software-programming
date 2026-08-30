using MediatR;

namespace CloudServiceStore.Application.Features.Orders.Queries.ExportOrders;

public record ExportOrderRequestsQuery() : IRequest<byte[]>;
