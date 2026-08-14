using System;
using MediatR;

namespace CloudServiceStore.Application.Features.Affiliates.Commands.Approve;

public record ApproveAffiliateCommand(Guid ApplicationId) : IRequest;
