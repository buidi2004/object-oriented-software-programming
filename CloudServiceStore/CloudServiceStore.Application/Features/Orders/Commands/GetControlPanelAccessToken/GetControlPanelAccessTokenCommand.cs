using MediatR;
using System;

namespace CloudServiceStore.Application.Features.Orders.Commands.GetControlPanelAccessToken;

public class GetControlPanelAccessTokenCommand : IRequest<string>
{
    public Guid OrderId { get; set; }

    public GetControlPanelAccessTokenCommand(Guid orderId)
    {
        OrderId = orderId;
    }
}
