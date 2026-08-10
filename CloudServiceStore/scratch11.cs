using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq.Expressions;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using CloudServiceStore.Domain.Primitives;

public sealed class DummyCart : AggregateRoot { }

class Program
{
    static async Task Main()
    {
        var mock = new Mock<IRepository<DummyCart>>(MockBehavior.Strict);
        mock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<DummyCart, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<DummyCart, object>>[]>()))
            .ReturnsAsync((DummyCart?)null);

        try {
            var cart = await mock.Object.FirstOrDefaultAsync(c => true, CancellationToken.None);
            Console.WriteLine($"DummyCart is null? {cart == null}");
        } catch (Exception ex) {
            Console.WriteLine("EXCEPTION: " + ex.Message);
        }
    }
}
