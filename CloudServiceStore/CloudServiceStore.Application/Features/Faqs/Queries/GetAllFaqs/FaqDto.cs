using System;

namespace CloudServiceStore.Application.Features.Faqs.Queries.GetAllFaqs;

public record FaqDto(
    Guid Id,
    string Question,
    string Answer,
    string CategoryTag,
    int DisplayOrder
);
