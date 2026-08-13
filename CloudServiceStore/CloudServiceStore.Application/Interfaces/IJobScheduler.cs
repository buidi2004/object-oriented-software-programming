using System;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace CloudServiceStore.Application.Interfaces;

public interface IJobScheduler
{
    string Schedule<T>(Expression<Action<T>> methodCall, TimeSpan delay);
    string Schedule<T>(Expression<Func<T, Task>> methodCall, TimeSpan delay);
}
