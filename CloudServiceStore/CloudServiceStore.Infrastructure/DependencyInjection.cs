using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Infrastructure.Dapper;
using CloudServiceStore.Infrastructure.ExternalServices.QrCode;
using CloudServiceStore.Infrastructure.Persistence;
using CloudServiceStore.Infrastructure.Persistence.Repositories;
using CloudServiceStore.Infrastructure.Security;
using CloudServiceStore.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddSingleton<IDapperContext, DapperContext>();
        services.AddSingleton<IQrCodeGeneratorFactory, QrCodeGeneratorFactory>();
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();

        return services;
    }
}
