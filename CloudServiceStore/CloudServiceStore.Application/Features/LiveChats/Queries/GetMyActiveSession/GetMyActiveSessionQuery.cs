using System;
using MediatR;

namespace CloudServiceStore.Application.Features.LiveChats.Queries.GetMyActiveSession;

public record GetMyActiveSessionQuery : IRequest<Guid?>;
