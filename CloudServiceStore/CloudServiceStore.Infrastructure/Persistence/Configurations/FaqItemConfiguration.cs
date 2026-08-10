using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class FaqItemConfiguration : IEntityTypeConfiguration<FaqItem>
{
    public void Configure(EntityTypeBuilder<FaqItem> builder)
    {
        builder.ToTable("Faqs");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Question)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(f => f.Answer)
            .IsRequired()
            .HasMaxLength(4000);

        builder.Property(f => f.CategoryTag)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(f => f.DisplayOrder)
            .IsRequired();
    }
}
