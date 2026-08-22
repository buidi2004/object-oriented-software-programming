namespace CloudServiceStore.Application.Features.FeatureRequests.DTOs;

public class FeatureRequestDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending / Planned / InProgress / Completed
    public int Upvotes { get; set; }
    public bool HasVoted { get; set; }
    public string AuthorName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
