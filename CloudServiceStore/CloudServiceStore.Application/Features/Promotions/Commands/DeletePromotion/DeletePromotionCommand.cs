using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Promotions.Commands.DeletePromotion;

public record DeletePromotionCommand(Guid Id) : IRequest;
