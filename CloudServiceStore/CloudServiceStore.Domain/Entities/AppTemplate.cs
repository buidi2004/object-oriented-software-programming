using CloudServiceStore.Domain.Primitives;

namespace CloudServiceStore.Domain.Entities;

public class AppTemplate : AggregateRoot
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public string DockerImage { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // WordPress, E-commerce, Blog, etc.
    public decimal Price { get; set; }
    public bool IsFree { get; set; }
    public bool IsActive { get; set; } = true;
}
