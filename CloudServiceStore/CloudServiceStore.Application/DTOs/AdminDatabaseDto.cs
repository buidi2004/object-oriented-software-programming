using System;

namespace CloudServiceStore.Application.DTOs;

public class AdminDatabaseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string OwnerEmail { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Engine { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public int Port { get; set; }
    public string Status { get; set; } = string.Empty;
    public string FailureReason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
