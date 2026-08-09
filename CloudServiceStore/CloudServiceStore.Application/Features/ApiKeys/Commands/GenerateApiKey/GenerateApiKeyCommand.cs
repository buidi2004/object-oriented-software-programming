using System;
using MediatR;

namespace CloudServiceStore.Application.Features.ApiKeys.Commands.GenerateApiKey;

public record GenerateApiKeyCommand(string Scopes) : IRequest<string>;
