using System;
using MediatR;

namespace CloudServiceStore.Application.Features.RefundRequests.Commands.ApproveRefundRequest;

public record ApproveRefundRequestCommand(Guid Id) : IRequest<bool>;
