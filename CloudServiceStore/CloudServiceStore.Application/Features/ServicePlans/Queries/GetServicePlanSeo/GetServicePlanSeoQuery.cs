using System;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Queries.GetServicePlanSeo;

public record GetServicePlanSeoQuery(Guid Id) : IRequest<ServicePlanSeoDto>;

public class ServicePlanSeoDto
{
    public Guid Id { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public string? Keywords { get; set; }
    public string? OpenGraphImage { get; set; }
}
