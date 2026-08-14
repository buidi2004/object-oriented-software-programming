using System;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Commands.CloseChatSession;

public record CloseChatSessionCommand(Guid SessionId) : IRequest;
