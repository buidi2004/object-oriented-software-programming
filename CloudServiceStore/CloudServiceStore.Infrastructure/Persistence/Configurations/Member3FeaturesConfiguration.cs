using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class ServiceTagNoteConfiguration : IEntityTypeConfiguration<ServiceTagNote>
{
    public void Configure(EntityTypeBuilder<ServiceTagNote> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ServiceType).IsRequired().HasMaxLength(50);
        builder.Property(x => x.ColorHex).HasMaxLength(16);
        builder.Property(x => x.TagsJson).HasMaxLength(2000);
        builder.Property(x => x.Note).HasMaxLength(1000);

        builder.HasIndex(x => new { x.UserId, x.ServiceType, x.ServiceId }).IsUnique();
    }
}

public class FeatureRequestConfiguration : IEntityTypeConfiguration<FeatureRequest>
{
    public void Configure(EntityTypeBuilder<FeatureRequest> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Status).IsRequired().HasMaxLength(32);

        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.CreatedAt);
    }
}

public class FeatureUpvoteConfiguration : IEntityTypeConfiguration<FeatureUpvote>
{
    public void Configure(EntityTypeBuilder<FeatureUpvote> builder)
    {
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.FeatureRequestId, x.UserId }).IsUnique();

        builder.HasOne<FeatureRequest>()
            .WithMany()
            .HasForeignKey(x => x.FeatureRequestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class DownloadableResourceConfiguration : IEntityTypeConfiguration<DownloadableResource>
{
    public void Configure(EntityTypeBuilder<DownloadableResource> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(2000);
        builder.Property(x => x.Category).IsRequired().HasMaxLength(100);
        builder.Property(x => x.FileUrl).IsRequired().HasMaxLength(1000);
        builder.Property(x => x.FileExtension).IsRequired().HasMaxLength(20);

        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.CreatedAt);
    }
}
