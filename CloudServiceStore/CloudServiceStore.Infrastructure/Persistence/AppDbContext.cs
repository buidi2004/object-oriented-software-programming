using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Primitives;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Application.Interfaces;
using MediatR;

namespace CloudServiceStore.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    private readonly IPublisher? _publisher;
    private readonly ICurrentUserService? _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options, IPublisher publisher = null!, ICurrentUserService currentUserService = null!) : base(options) 
    { 
        _publisher = publisher;
        _currentUserService = currentUserService;
    }

    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<ServicePlan> ServicePlans => Set<ServicePlan>();
    public DbSet<PlanPrice> PlanPrices => Set<PlanPrice>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<NewsArticle> NewsArticles => Set<NewsArticle>();
    public DbSet<OrderRequest> OrderRequests => Set<OrderRequest>();
    public DbSet<AffiliateApplication> AffiliateApplications => Set<AffiliateApplication>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<RefundRequest> RefundRequests => Set<RefundRequest>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<SupportTicket> SupportTickets => Set<SupportTicket>();
    public DbSet<TicketMessage> TicketMessages => Set<TicketMessage>();
    public DbSet<LoginHistory> LoginHistories => Set<LoginHistory>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<NotificationSetting> NotificationSettings => Set<NotificationSetting>();
    public DbSet<VpsInstance> VpsInstances => Set<VpsInstance>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<ExchangeRate> ExchangeRates => Set<ExchangeRate>();
    public DbSet<SavedPaymentMethod> SavedPaymentMethods => Set<SavedPaymentMethod>();
    public DbSet<ReferralCode> ReferralCodes => Set<ReferralCode>();
    public DbSet<ReferralReward> ReferralRewards => Set<ReferralReward>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<LoyaltyPoint> LoyaltyPoints => Set<LoyaltyPoint>();
    public DbSet<LoyaltyTransaction> LoyaltyTransactions => Set<LoyaltyTransaction>();
    public DbSet<GiftCard> GiftCards => Set<GiftCard>();
    public DbSet<NewsletterSubscriber> NewsletterSubscribers => Set<NewsletterSubscriber>();
    public DbSet<Banner> Banners => Set<Banner>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<BackupJob> BackupJobs => Set<BackupJob>();
    public DbSet<DnsRecord> DnsRecords => Set<DnsRecord>();
    public DbSet<DomainRecord> DomainRecords => Set<DomainRecord>();
    public DbSet<MigrationRequest> MigrationRequests => Set<MigrationRequest>();
    public DbSet<RenewalJob> RenewalJobs => Set<RenewalJob>();
    public DbSet<ServiceStatusLog> ServiceStatusLogs => Set<ServiceStatusLog>();
    public DbSet<SslCertificate> SslCertificates => Set<SslCertificate>();
    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<WalletTransaction> WalletTransactions => Set<WalletTransaction>();
    public DbSet<FaqItem> Faqs => Set<FaqItem>();
    public DbSet<KnowledgeBaseArticle> KnowledgeBaseArticles => Set<KnowledgeBaseArticle>();
    public DbSet<ArticleComment> ArticleComments => Set<ArticleComment>();
    public DbSet<CartReminder> CartReminders => Set<CartReminder>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<ChatSession> ChatSessions => Set<ChatSession>();
    public DbSet<ControlPanelCredential> ControlPanelCredentials => Set<ControlPanelCredential>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RecentlyViewedItem> RecentlyViewedItems => Set<RecentlyViewedItem>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        
        foreach (var relationship in builder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        builder.Entity<Cart>()
            .HasMany(c => c.Items)
            .WithOne(ci => ci.Cart)
            .HasForeignKey(ci => ci.CartId)
            .OnDelete(DeleteBehavior.Cascade);

        base.OnModelCreating(builder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var auditEntries = new List<AuditLog>();
        var userId = _currentUserService?.UserId;
        var ipAddress = _currentUserService?.IpAddress ?? "127.0.0.1";
        
        foreach (var entry in ChangeTracker.Entries())
        {
            Console.WriteLine($"[DEBUG EF] ENTITY: {entry.Entity.GetType().Name} - STATE: {entry.State}");
        }

        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            // Only audit AggregateRoots or important entities. We will just audit all Entities.
            if (entry.Entity is not Entity)
                continue;
                
            var entityType = entry.Entity.GetType();
            // Handle proxy types if lazy loading is enabled
            var entityName = entityType.Name.Contains("Proxy") ? entityType.BaseType?.Name ?? entityType.Name : entityType.Name;

            var action = entry.State switch
            {
                EntityState.Added => AuditAction.Create,
                EntityState.Modified => AuditAction.Update,
                EntityState.Deleted => AuditAction.Delete,
                _ => AuditAction.Update
            };
            
            string entityId = string.Empty;
            var idProp = entry.Properties.FirstOrDefault(p => p.Metadata.IsPrimaryKey());
            if (idProp != null)
            {
                entityId = idProp.CurrentValue?.ToString() ?? string.Empty;
            }

            // Exclude logs that don't have PK set (for Added, PK might be set after SaveChanges, but Guids usually generate on client side)
            if (entry.State != EntityState.Added || !string.IsNullOrEmpty(entityId))
            {
                auditEntries.Add(new AuditLog
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Action = action,
                    EntityName = entityName,
                    EntityId = entityId,
                    IpAddress = ipAddress,
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        if (auditEntries.Any())
        {
            AuditLogs.AddRange(auditEntries);
        }

        var result = await base.SaveChangesAsync(cancellationToken);

        // Dispatch Domain Events after saving to database
        if (_publisher != null)
        {
            var entities = ChangeTracker.Entries<Entity>()
                .Where(e => e.Entity.GetDomainEvents().Any())
                .Select(e => e.Entity)
                .ToList();

            var domainEvents = entities
                .SelectMany(e => e.GetDomainEvents())
                .ToList();

            entities.ForEach(e => e.ClearDomainEvents());

            foreach (var domainEvent in domainEvents)
            {
                await _publisher.Publish(domainEvent, cancellationToken);
            }
        }

        return result;
    }
}
