namespace CloudServiceStore.Application.Interfaces;

public class FrontendSettings
{
    public const string SectionName = "Frontend";
    public string BaseUrl { get; set; } = "http://localhost:3000";
}
