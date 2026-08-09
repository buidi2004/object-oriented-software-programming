using System;
using MediatR;

namespace CloudServiceStore.Application.Features.ApiKeys.Commands.RevokeApiKey;

public record RevokeApiKeyCommand(Guid Id) : IRequest<bool>;
