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
        var expectedCart = new Cart(Guid.NewGuid());
        mock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<Cart, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<Cart, object>>[]>()))
            .ReturnsAsync(expectedCart);
            
        try {
            var cart = await mock.Object.FirstOrDefaultAsync(c => c.UserId == Guid.NewGuid(), CancellationToken.None);
            Console.WriteLine($"Cart == expectedCart? {cart == expectedCart}");
        } catch (Exception ex) {
            Console.WriteLine("EXCEPTION: " + ex.Message);
        }
    }
}
