using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Coupons.Commands.ApplyCoupon;

public record ApplyCouponCommand(Guid OrderId, string Code) : IRequest<bool>;
