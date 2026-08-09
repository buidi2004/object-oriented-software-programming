using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Behaviors;

public class CachingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        // Simple placeholder for caching logic
        return await next();
    }
}
