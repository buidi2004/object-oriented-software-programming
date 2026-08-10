using MediatR;
using System;

namespace CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;

public record CreateFaqItemCommand(
    string Question,
    string Answer,
    string CategoryTag,
    int DisplayOrder
) : IRequest<Guid>;
