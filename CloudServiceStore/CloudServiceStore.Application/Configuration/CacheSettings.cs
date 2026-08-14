namespace CloudServiceStore.Application.Configuration;

public class CacheSettings
{
    public const string SectionName = "Cache";

    public bool Enabled { get; set; } = true;

    public string RedisConnectionString { get; set; } = "localhost:6379";

    public int CategoriesTtlMinutes { get; set; } = 20;
    public int CategoryPlansTtlMinutes { get; set; } = 15;
    public int ServicePlanTtlMinutes { get; set; } = 15;
    public int ExchangeRatesTtlMinutes { get; set; } = 10;
    public int FaqsTtlMinutes { get; set; } = 60;
}
