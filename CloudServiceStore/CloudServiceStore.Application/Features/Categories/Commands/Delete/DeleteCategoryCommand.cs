using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Categories.Commands.Delete;

public record DeleteCategoryCommand(Guid Id) : IRequest;
