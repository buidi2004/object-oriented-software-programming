using System.Collections.Generic;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlansWithCurrency;

public class GetServicePlansWithCurrencyQuery : IRequest<IReadOnlyList<ServicePlanPriceDto>>
{
    public string Currency { get; set; } = "VND";
}
