namespace CloudServiceStore.Application.Caching;

public static class CatalogCacheKeys
{
    public const string Categories = "catalog:categories:v1";
    public const string ExchangeRates = "catalog:exchange-rates:v1";
    public const string Faqs = "content:faqs:v1";
    public const string ActivePromotions = "catalog:promotions:active:v1";

    public static string CategoryPlans(string slug, string currency) =>
        $"catalog:cat-plans:{NormalizeSlug(slug)}:{NormalizeCurrency(currency)}:v1";

    public static string ServicePlan(Guid planId, string currency) =>
        $"catalog:plan:{planId:N}:{NormalizeCurrency(currency)}:v1";

    public static string AllPlanPrices(string currency) =>
        $"catalog:all-plans:{NormalizeCurrency(currency)}:v1";

    public static string CatalogPrefix => "catalog:";
    public static string ContentPrefix => "content:";

    public static readonly TimeSpan CategoriesTtl = TimeSpan.FromMinutes(20);
    public static readonly TimeSpan CategoryPlansTtl = TimeSpan.FromMinutes(15);
    public static readonly TimeSpan ServicePlanTtl = TimeSpan.FromMinutes(15);
    public static readonly TimeSpan AllPlanPricesTtl = TimeSpan.FromMinutes(15);
    public static readonly TimeSpan ExchangeRatesTtl = TimeSpan.FromMinutes(10);
    public static readonly TimeSpan FaqsTtl = TimeSpan.FromMinutes(60);
    public static readonly TimeSpan ActivePromotionsTtl = TimeSpan.FromMinutes(5);

    private static string NormalizeSlug(string slug) =>
        slug.Trim().ToLowerInvariant();

    private static string NormalizeCurrency(string currency) =>
        (currency ?? "VND").Trim().ToUpperInvariant();
}
