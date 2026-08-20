using System;
using MediatR;

namespace CloudServiceStore.Application.Features.NotificationSettings.Commands.UpdateNotificationSetting;

public record UpdateNotificationSettingCommand(
    bool EmailOnOrder,
    bool EmailOnSecurity,
    bool EmailOnPromotion,
    string? PhoneNumber = null,
    string? ZaloId = null,
    string? TelegramChatId = null,
    bool SmsOnOrder = false,
    bool SmsOnExpiring = false,
    bool ZaloOnPromotion = false,
    bool TelegramOnAlert = false) : IRequest;
