using System;
using MediatR;

namespace CloudServiceStore.Application.Features.ControlPanels.Queries.GetCredentials;

public record ControlPanelCredentialDto(Guid Id, Guid OrderId, string PanelType, string Url, string Username, string Password);

public record GetControlPanelCredentialsQuery(Guid OrderId) : IRequest<ControlPanelCredentialDto?>;
