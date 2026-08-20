using System;
using MediatR;

namespace CloudServiceStore.Application.Features.NotificationSettings.Queries.GetMyNotificationSetting;

public record NotificationSettingDto(
    bool EmailOnOrder,
    bool EmailOnSecurity,
    bool EmailOnPromotion,
    string? PhoneNumber,
    string? ZaloId,
    string? TelegramChatId,
    bool SmsOnOrder,
    bool SmsOnExpiring,
    bool ZaloOnPromotion,
    bool TelegramOnAlert);

public record GetMyNotificationSettingQuery() : IRequest<NotificationSettingDto>;
