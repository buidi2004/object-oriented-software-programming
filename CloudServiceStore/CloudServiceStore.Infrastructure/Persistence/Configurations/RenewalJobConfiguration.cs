using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class RenewalJobConfiguration : IEntityTypeConfiguration<RenewalJob>
{
    public void Configure(EntityTypeBuilder<RenewalJob> builder)
    {
        builder.HasKey(x => x.Id);
    }
}
