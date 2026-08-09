using System;

namespace CloudServiceStore.Domain.Entities;

public class LoginHistory
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string IpAddress { get; set; } = null!;
    public string UserAgent { get; set; } = null!;
    public bool IsSuccess { get; set; }
    public DateTime LoginAt { get; set; }
    
    public AppUser User { get; set; } = null!;
}
