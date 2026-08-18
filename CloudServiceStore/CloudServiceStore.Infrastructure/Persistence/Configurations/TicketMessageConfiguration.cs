using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using CloudServiceStore.Domain.Entities;

namespace CloudServiceStore.Infrastructure.Persistence.Configurations;

public class TicketMessageConfiguration : IEntityTypeConfiguration<TicketMessage>
{
    public void Configure(EntityTypeBuilder<TicketMessage> builder)
    {
        builder.HasOne(tm => tm.Ticket).WithMany(t => t.Messages).HasForeignKey(tm => tm.TicketId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(tm => tm.Sender).WithMany().HasForeignKey(tm => tm.SenderId).OnDelete(DeleteBehavior.Restrict);
    }
}
