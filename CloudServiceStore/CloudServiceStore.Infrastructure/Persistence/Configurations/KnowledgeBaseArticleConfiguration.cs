using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class KnowledgeBaseArticleConfiguration : IEntityTypeConfiguration<KnowledgeBaseArticle>
{
    public void Configure(EntityTypeBuilder<KnowledgeBaseArticle> builder)
    {
        builder.ToTable("KnowledgeBaseArticles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Slug)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Content)
            .IsRequired();

        builder.Property(x => x.CategoryTag)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.IsPublished)
            .IsRequired();

        builder.Property(x => x.ViewCount)
            .IsRequired()
            .HasDefaultValue(0);

        builder.HasOne(x => x.Author)
            .WithMany()
            .HasForeignKey(x => x.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);
            
        builder.HasIndex(x => x.Slug).IsUnique();
    }
}
