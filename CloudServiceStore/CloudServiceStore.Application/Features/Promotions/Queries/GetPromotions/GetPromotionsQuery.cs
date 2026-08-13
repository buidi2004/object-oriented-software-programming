using System;
using System.Collections.Generic;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Queries.GetPromotions;

public record PromotionDto(Guid Id, Guid? ServicePlanId, decimal DiscountPercent, DateTime StartDate, DateTime EndDate);

public record GetPromotionsQuery() : IRequest<IReadOnlyList<PromotionDto>>;
