using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Features.Orders.Commands.GetControlPanelAccessToken;

public class GetControlPanelAccessTokenCommandHandler : IRequestHandler<GetControlPanelAccessTokenCommand, string>
{
    private readonly IRepository<OrderRequest> _orderRepository;
    private readonly ICurrentUserService _currentUserService;

    public GetControlPanelAccessTokenCommandHandler(IRepository<OrderRequest> orderRepository, ICurrentUserService currentUserService)
    {
        _orderRepository = orderRepository;
        _currentUserService = currentUserService;
    }

    public async Task<string> Handle(GetControlPanelAccessTokenCommand request, CancellationToken cancellationToken)
    {
        var order = await _orderRepository.GetByIdAsync(request.OrderId, cancellationToken);
        if (order == null)
            throw new Exception("Order not found");

        if (order.UserId != _currentUserService.UserId)
            throw new UnauthorizedAccessException();

        if (order.Status != OrderStatus.Paid)
            throw new Exception("Order is not active/paid");

        // Dummy token generation for demo purposes
        return $"cp_token_{Guid.NewGuid():N}";
    }
}
