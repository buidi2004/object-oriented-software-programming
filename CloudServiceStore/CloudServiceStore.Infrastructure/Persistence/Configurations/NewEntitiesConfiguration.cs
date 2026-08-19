using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

// Module #14: Static Site Hosting
public class StaticSiteConfiguration : IEntityTypeConfiguration<StaticSite>
{
    public void Configure(EntityTypeBuilder<StaticSite> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.HasIndex(x => x.IdempotencyKey).IsUnique();
        builder.HasMany(s => s.Deploys).WithOne().HasForeignKey(d => d.StaticSiteId);

        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.NoAction);
    }
}

public class StaticDeployConfiguration : IEntityTypeConfiguration<StaticDeploy>
{
    public void Configure(EntityTypeBuilder<StaticDeploy> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.GitCommitHash).IsRequired().HasMaxLength(64);
        builder.Property(x => x.Status).HasConversion<long>();
    }
}

// Module #4: CDN Distribution
public class CdnDistributionConfiguration : IEntityTypeConfiguration<CdnDistribution>
{
    public void Configure(EntityTypeBuilder<CdnDistribution> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.OriginUrl).IsRequired();
        builder.Property(x => x.Cname).IsRequired().HasMaxLength(255);
        builder.HasIndex(x => x.IdempotencyKey).IsUnique();
    }
}

// Module #7: Dedicated Server
public class DedicatedServerConfiguration : IEntityTypeConfiguration<DedicatedServer>
{
    public void Configure(EntityTypeBuilder<DedicatedServer> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ServerName).IsRequired().HasMaxLength(255);
        builder.Property(x => x.OsImage).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Status).HasConversion<long>();
    }
}

// Module #2: Email Hosting
public class EmailHostingAccountConfiguration : IEntityTypeConfiguration<EmailHostingAccount>
{
    public void Configure(EntityTypeBuilder<EmailHostingAccount> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Domain).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
    }
}

// Module #8: Website Builder
public class WebsiteBuilderProjectConfiguration : IEntityTypeConfiguration<WebsiteBuilderProject>
{
    public void Configure(EntityTypeBuilder<WebsiteBuilderProject> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.HasIndex(x => x.IdempotencyKey).IsUnique();
        builder.Property(x => x.Status).HasConversion<long>();
        builder.HasMany(p => p.Pages).WithOne().HasForeignKey(pg => pg.ProjectId);
    }
}

public class WebsitePageConfiguration : IEntityTypeConfiguration<WebsitePage>
{
    public void Configure(EntityTypeBuilder<WebsitePage> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.PageName).IsRequired().HasMaxLength(255);
        builder.Property(x => x.ContentJson).HasDefaultValue("{}");
    }
}

// Module #16: Marketplace
public class MarketplaceListingConfiguration : IEntityTypeConfiguration<MarketplaceListing>
{
    public void Configure(EntityTypeBuilder<MarketplaceListing> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Description).IsRequired();
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
        builder.Property(x => x.Category).IsRequired().HasMaxLength(100);
        builder.HasIndex(x => x.IdempotencyKey).IsUnique();
        builder.Property(x => x.Status).HasConversion<long>();
    }
}

public class MarketplacePurchaseConfiguration : IEntityTypeConfiguration<MarketplacePurchase>
{
    public void Configure(EntityTypeBuilder<MarketplacePurchase> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Status).HasConversion<long>();
        builder.Property(x => x.DownloadUrl).HasMaxLength(500);
    }
}
