using MediatR;
using System;

namespace CloudServiceStore.Application.Features.Faqs.Commands.UpdateFaqItem;

public record UpdateFaqItemCommand(
    Guid Id,
    string Question,
    string Answer,
    string CategoryTag,
    int DisplayOrder
) : IRequest<bool>;
