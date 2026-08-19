using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Tickets.Queries.GetTicketQueue;

public record TicketQueueDto(
    Guid Id,
    string Subject,
    string Status,
    string Priority,
    Guid UserId,
    string CustomerName,
    string CustomerEmail,
    string Category,
    string? AssignedTo,
    DateTime CreatedAt,
    DateTime LastMessageAt,
    int MessageCount,
    Guid? AssignedStaffId);

public record GetTicketQueueQuery() : IRequest<IReadOnlyList<TicketQueueDto>>;
