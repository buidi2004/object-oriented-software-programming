using System;

namespace CloudServiceStore.Application.DTOs;

public class ReferralDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = null!;
}
