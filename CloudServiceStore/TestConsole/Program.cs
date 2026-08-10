using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using Moq;

class Program
{
    static void Main()
    {
        var walletId = Guid.NewGuid();
        var orderId = Guid.NewGuid();
        var transaction = new WalletTransaction(walletId, 100m, TransactionType.Payment, orderId);
        
        Console.WriteLine($"Amount: {transaction.Amount}");
        Console.WriteLine($"Type: {(int)transaction.Type}");
        Console.WriteLine($"Match: {transaction.Amount == -100m && (int)transaction.Type == 1}");
    }
}
