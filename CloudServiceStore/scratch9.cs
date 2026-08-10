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
        var mock = new Mock<IRepository<AppUser>>(MockBehavior.Strict);
        mock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<AppUser, bool>>>(), It.IsAny<CancellationToken>(), It.IsAny<Expression<Func<AppUser, object>>[]>()))
            .ReturnsAsync((AppUser?)null);
            
        try {
            var user = await mock.Object.FirstOrDefaultAsync(c => c.Email == "test", CancellationToken.None);
            Console.WriteLine($"AppUser is null? {user == null}");
        } catch (Exception ex) {
            Console.WriteLine("EXCEPTION: " + ex.Message);
        }
    }
}
