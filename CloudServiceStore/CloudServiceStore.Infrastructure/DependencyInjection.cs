using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Infrastructure.Caching;
using CloudServiceStore.Infrastructure.Dapper;
using CloudServiceStore.Infrastructure.ExternalServices.QrCode;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Infrastructure.Persistence.Repositories;
using CloudServiceStore.Infrastructure.Security;
using CloudServiceStore.Infrastructure.Helpers;
using CloudServiceStore.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using CloudServiceStore.Infrastructure.BackgroundServices;

namespace CloudServiceStore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<CacheSettings>(configuration.GetSection(CacheSettings.SectionName));
        services.Configure<ProvisioningSettings>(configuration.GetSection(ProvisioningSettings.SectionName));
        services.Configure<MinIOSettings>(configuration.GetSection(MinIOSettings.SectionName));
        services.Configure<AcmeSettings>(configuration.GetSection(AcmeSettings.SectionName));
        AddCatalogCaching(services, configuration);

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddSingleton<IDapperContext, DapperContext>();
        services.AddSingleton<IQrCodeGeneratorFactory, QrCodeGeneratorFactory>();
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();
        services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));

        // Use real Gmail SMTP if configured, otherwise fall back to logging-only
        var senderEmail = configuration[$"{EmailSettings.SectionName}:SenderEmail"];
        if (!string.IsNullOrWhiteSpace(senderEmail))
        {
            services.AddScoped<IEmailService, GmailEmailService>();
        }
        else
        {
            services.AddScoped<IEmailService, LoggingEmailService>();
        }

        // Shared provisioning infrastructure
        services.AddSingleton<DockerClientFactory>();
        services.AddSingleton<DockerPortAllocator>();
        services.AddSingleton<DockerResourceChecker>();
        services.AddSingleton<IAcmeChallengeStore, AcmeChallengeStore>();

        services.AddSingleton<IVpsSpecParser, VpsSpecParser>();
        services.AddScoped<IVpsProvisioningService, DockerVpsProvisioningService>();
        services.AddScoped<IAcmeProvisioningService, AcmeProvisioningService>();
        services.AddScoped<IMinioProvisioningService, MinioProvisioningService>();
        services.AddScoped<IDatabaseProvisioningService, DockerDatabaseProvisioningService>();
        services.AddScoped<IGameServerProvisioningService, DockerGameServerProvisioningService>();
        services.AddScoped<IAppInstallerService, DockerAppInstallerService>();
        services.AddScoped<ICdnProvisioningService, CloudflareCdnProvisioningService>();
        services.AddScoped<IStaticSiteProvisioningService, DockerStaticSiteProvisioningService>();
        services.AddSingleton<IJobScheduler, HangfireJobScheduler>();
        services.AddHostedService<CloudServiceStore.Infrastructure.BackgroundServices.VpsIdleMonitorService>();
        services.AddScoped<ITerminateVpsJob, TerminateVpsJob>();

        // Background Queue & Workers
        services.AddSingleton<IResourceProvisioningQueue, ResourceProvisioningQueue>();
        services.AddHostedService<ResourceProvisioningWorker>();
        services.AddHostedService<SubscriptionMonitorWorker>();

        return services;
    }

    private static void AddCatalogCaching(IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<CacheSettings>(configuration.GetSection(CacheSettings.SectionName));

        services.AddSingleton<ICatalogCache>(sp =>
        {
            var settings = sp.GetRequiredService<IOptions<CacheSettings>>().Value;
            var env = sp.GetRequiredService<IHostEnvironment>();
            var logger = sp.GetRequiredService<ILogger<RedisCatalogCache>>();
            var useRedis = settings.Enabled && !env.IsEnvironment("Testing") && !string.IsNullOrWhiteSpace(settings.RedisConnectionString);

            IDistributedCache cache;
            IConnectionMultiplexer? redis = null;

            if (useRedis)
            {
                try
                {
                    var redisOptions = ConfigurationOptions.Parse(settings.RedisConnectionString);
                    redisOptions.AbortOnConnectFail = false;
                    redisOptions.ConnectTimeout = 1000;
                    redisOptions.AsyncTimeout = 1000;
                    redis = ConnectionMultiplexer.Connect(redisOptions);
                    cache = new RedisCache(new RedisCacheOptions
                    {
                        ConfigurationOptions = redisOptions,
                        InstanceName = "css:"
                    });
                }
                catch (Exception ex)
                {
                    logger.LogWarning(ex, "Failed to connect to Redis. Falling back to MemoryDistributedCache.");
                    cache = new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions()));
                }
            }
            else
            {
                cache = new MemoryDistributedCache(Options.Create(new MemoryDistributedCacheOptions()));
            }

            return new RedisCatalogCache(cache, Options.Create(settings), logger, redis);
        });
    }
}
