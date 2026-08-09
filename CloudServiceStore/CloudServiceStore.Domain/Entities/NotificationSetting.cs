using System;

namespace CloudServiceStore.Domain.Entities;

public class NotificationSetting
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; } // Unique (1-1)
    public bool EmailOnOrder { get; set; }
    public bool EmailOnSecurity { get; set; }
    public bool EmailOnPromotion { get; set; }
    
    public AppUser User { get; set; } = null!;
}
