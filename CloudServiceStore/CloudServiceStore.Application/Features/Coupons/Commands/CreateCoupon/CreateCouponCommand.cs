using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Coupons.Commands.CreateCoupon;

public record CreateCouponCommand(
    string Code, 
    decimal DiscountPercent, 
    int MaxUsage, 
    DateTime ExpiryDate, 
    bool IsActive) : IRequest<Guid>;
