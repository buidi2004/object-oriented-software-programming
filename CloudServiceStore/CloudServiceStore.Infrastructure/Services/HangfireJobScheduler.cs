using System;
using System.Linq.Expressions;
using System.Threading.Tasks;
using CloudServiceStore.Application.Interfaces;
using Hangfire;

namespace CloudServiceStore.Infrastructure.Services;

public class HangfireJobScheduler : IJobScheduler
{
    private readonly IBackgroundJobClient _backgroundJobs;

    public HangfireJobScheduler(IBackgroundJobClient backgroundJobs)
    {
        _backgroundJobs = backgroundJobs;
    }

    public string Schedule<T>(Expression<Action<T>> methodCall, TimeSpan delay)
    {
        return _backgroundJobs.Schedule(methodCall, delay);
    }

    public string Schedule<T>(Expression<Func<T, Task>> methodCall, TimeSpan delay)
    {
        return _backgroundJobs.Schedule(methodCall, delay);
    }
}
