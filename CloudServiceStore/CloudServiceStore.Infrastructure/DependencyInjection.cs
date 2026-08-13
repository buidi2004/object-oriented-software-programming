using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Infrastructure.Caching;
using CloudServiceStore.Infrastructure.Dapper;
using CloudServiceStore.Infrastructure.ExternalServices.QrCode;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Infrastructure.Persistence.Repositories;
using CloudServiceStore.Infrastructure.Security;
using CloudServiceStore.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.StackExchangeRedis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace CloudServiceStore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<CacheSettings>(configuration.GetSection(CacheSettings.SectionName));
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
        services.AddScoped<IEmailService, LoggingEmailService>();

        services.AddSingleton<IVpsSpecParser, VpsSpecParser>();
        services.AddSingleton<IVpsProvisioningService, DockerVpsProvisioningService>();
        services.AddSingleton<IJobScheduler, HangfireJobScheduler>();
        services.AddHostedService<CloudServiceStore.Infrastructure.BackgroundServices.VpsIdleMonitorService>();
        services.AddScoped<ITerminateVpsJob, TerminateVpsJob>();

        return services;
    }

    private static void AddCatalogCaching(IServiceCollection services, IConfiguration configuration)
    {
        var cacheSettings = configuration.GetSection(CacheSettings.SectionName).Get<CacheSettings>() ?? new CacheSettings();
        var environment = configuration["ASPNETCORE_ENVIRONMENT"] ?? "Production";
        var useRedis = cacheSettings.Enabled && !string.Equals(environment, "Testing", StringComparison.OrdinalIgnoreCase);

        if (useRedis)
        {
            services.AddStackExchangeRedisCache(options =>
            {
                options.Configuration = cacheSettings.RedisConnectionString;
                options.InstanceName = "css:";
            });

            services.AddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(cacheSettings.RedisConnectionString));
        }
        else
        {
            services.AddDistributedMemoryCache();
        }

        services.AddSingleton<ICatalogCache, RedisCatalogCache>();
    }
}
