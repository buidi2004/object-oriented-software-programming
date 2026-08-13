using System;
using MediatR;

namespace CloudServiceStore.Application.Features.NotificationSettings.Commands.UpdateNotificationSetting;

public record UpdateNotificationSettingCommand(bool EmailOnOrder, bool EmailOnSecurity, bool EmailOnPromotion) : IRequest;
