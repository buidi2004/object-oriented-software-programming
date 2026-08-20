using MediatR;

namespace CloudServiceStore.Application.Features.WebsiteBuilder.Commands.CreateProject;

public record CreateProjectCommand(string Name, string TemplateId, string IdempotencyKey) : IRequest<Guid>;
