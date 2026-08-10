using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace CloudServiceStore.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(AssemblyMarker).Assembly));
        services.AddValidatorsFromAssembly(typeof(AssemblyMarker).Assembly);

        services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(Behaviors.ValidationBehavior<,>));
        services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(Behaviors.LoggingBehavior<,>));
        services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(Behaviors.CachingBehavior<,>));
        services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(Behaviors.PerformanceBehavior<,>));

        return services;
    }
}
