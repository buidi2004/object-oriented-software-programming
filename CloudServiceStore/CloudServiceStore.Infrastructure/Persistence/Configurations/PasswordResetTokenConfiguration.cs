using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.TokenHash).IsRequired().HasMaxLength(128);
        builder.HasIndex(x => x.TokenHash);
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId);
    }
}
