using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class NewsArticleConfiguration : IEntityTypeConfiguration<NewsArticle>
{
    public void Configure(EntityTypeBuilder<NewsArticle> builder)
    {
        builder.ToTable("NewsArticles");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Title)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(n => n.Slug)
            .IsRequired()
            .HasMaxLength(256);
            
        builder.HasIndex(n => n.Slug).IsUnique();

        builder.Property(n => n.Content)
            .IsRequired();

        builder.Property(n => n.ThumbnailUrl)
            .HasMaxLength(1000);

        builder.Property(n => n.Tags)
            .HasMaxLength(500);

        builder.Property(n => n.ViewCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.Property(n => n.Status)
            .IsRequired();

        builder.HasOne(n => n.Author)
            .WithMany()
            .HasForeignKey(n => n.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
