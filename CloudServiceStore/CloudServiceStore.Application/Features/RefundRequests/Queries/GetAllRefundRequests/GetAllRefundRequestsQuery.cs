using System.Collections.Generic;
using CloudServiceStore.Domain.Entities;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Queries.GetAllRefundRequests;

public record GetAllRefundRequestsQuery() : IRequest<IEnumerable<RefundRequest>>;
