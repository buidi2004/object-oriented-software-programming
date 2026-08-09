using System.Collections.Generic;
using CloudServiceStore.Domain.Entities;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Queries.GetMyRefundRequests;

public record GetMyRefundRequestsQuery() : IRequest<IEnumerable<RefundRequest>>;
