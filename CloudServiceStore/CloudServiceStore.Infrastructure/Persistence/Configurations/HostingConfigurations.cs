using CloudServiceStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class HostingPlanConfiguration : IEntityTypeConfiguration<HostingPlan>
{
    public void Configure(EntityTypeBuilder<HostingPlan> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(255);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.Price).HasColumnType("decimal(18,2)");
    }
}

public class HostingAccountConfiguration : IEntityTypeConfiguration<HostingAccount>
{
    public void Configure(EntityTypeBuilder<HostingAccount> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ContainerId).HasMaxLength(255);
        builder.Property(x => x.ControlPanelUrl).HasMaxLength(500);
        
        builder.HasOne(x => x.User)
               .WithMany()
               .HasForeignKey(x => x.UserId)
               .OnDelete(DeleteBehavior.Restrict);
               
        builder.HasOne(x => x.Plan)
               .WithMany()
               .HasForeignKey(x => x.PlanId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
