using System;
using MediatR;

namespace CloudServiceStore.Application.Features.RecentlyViewed.Commands.RecordView;

public record RecordViewCommand(Guid ServicePlanId) : IRequest;
