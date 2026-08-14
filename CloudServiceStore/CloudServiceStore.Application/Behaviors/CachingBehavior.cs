using CloudServiceStore.Application.Interfaces;
using MediatR;

namespace CloudServiceStore.Application.Behaviors;

public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ICatalogCache _catalogCache;

    public CachingBehavior(ICatalogCache catalogCache)
    {
        _catalogCache = catalogCache;
    }

    public Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is not ICacheableQuery cacheable)
        {
            return next();
        }

        return _catalogCache.GetOrSetAsync(
            cacheable.CacheKey,
            cacheable.CacheDuration,
            async ct => await next(),
            cancellationToken);
    }
}
