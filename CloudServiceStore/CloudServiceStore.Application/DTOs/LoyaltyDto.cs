using System;

namespace CloudServiceStore.Application.DTOs;

public class LoyaltyDto
{
    public Guid UserId { get; set; }
    public int Points { get; set; }
}
