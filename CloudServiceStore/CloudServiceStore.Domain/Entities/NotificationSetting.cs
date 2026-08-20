using CloudServiceStore.Domain.Primitives;
using System;

namespace CloudServiceStore.Domain.Entities;

public class NotificationSetting : AggregateRoot
{
    public Guid UserId { get; set; } // Unique (1-1)
    public bool EmailOnOrder { get; set; }
    public bool EmailOnSecurity { get; set; }
    public bool EmailOnPromotion { get; set; }
    public string? PhoneNumber { get; set; }
    public string? ZaloId { get; set; }
    public string? TelegramChatId { get; set; }
    public bool SmsOnOrder { get; set; }
    public bool SmsOnExpiring { get; set; }
    public bool ZaloOnPromotion { get; set; }
    public bool TelegramOnAlert { get; set; }
    
    public AppUser User { get; set; } = null!;
}
