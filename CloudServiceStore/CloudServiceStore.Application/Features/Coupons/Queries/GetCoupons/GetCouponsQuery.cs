using System.Collections.Generic;
using CloudServiceStore.Domain.Entities;
using MediatR;

namespace CloudServiceStore.Application.Features.Coupons.Queries.GetCoupons;

public record GetCouponsQuery() : IRequest<IEnumerable<Coupon>>;
