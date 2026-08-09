using System;
using System.Threading;
using System.Threading.Tasks;
using System.Linq.Expressions;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;

class Program
{
    static async Task Main()
    {
        var mock = new Mock<IRepository<Cart>>(MockBehavior.Strict);
        mock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Cart, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Cart, object>>[]>()))
            .Returns(() => Task.FromResult((Cart?)null));
            
        try {
            var cart = await mock.Object.FirstOrDefaultAsync(c => c.UserId == Guid.NewGuid(), CancellationToken.None);
            Console.WriteLine($"Cart is null? {cart == null}");
        } catch (Exception ex) {
            Console.WriteLine("EXCEPTION: " + ex.Message);
        }
    }
}
