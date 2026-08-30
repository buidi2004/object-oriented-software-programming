using System;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetPlanQrCode;

public record GetPlanQrCodeQuery(Guid PlanId) : IRequest<string>;
