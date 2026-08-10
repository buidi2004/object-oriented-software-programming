using MediatR;
using System;

namespace CloudServiceStore.Application.Features.Faqs.Commands.DeleteFaqItem;

public record DeleteFaqItemCommand(Guid Id) : IRequest<bool>;
