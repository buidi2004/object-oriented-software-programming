using System;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Commands.StartChatSession;

public record StartChatSessionCommand() : IRequest<Guid>;
