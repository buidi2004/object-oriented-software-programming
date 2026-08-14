using System;
using MediatR;

namespace CloudServiceStore.Application.Features.ServicePlans.Commands.UpdateSeo;

public record UpdateSeoCommand(
    Guid Id, 
    string? MetaTitle, 
    string? MetaDescription, 
    string? Keywords,
    string? OpenGraphImage) : IRequest;
