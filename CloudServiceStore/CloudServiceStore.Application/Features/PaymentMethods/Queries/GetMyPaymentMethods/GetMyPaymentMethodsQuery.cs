using System.Collections.Generic;
using CloudServiceStore.Application.DTOs;
using MediatR;

namespace CloudServiceStore.Application.Features.PaymentMethods.Queries.GetMyPaymentMethods;

public class GetMyPaymentMethodsQuery : IRequest<IReadOnlyList<SavedPaymentMethodDto>> { }
