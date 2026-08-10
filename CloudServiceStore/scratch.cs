using System;
using CloudServiceStore.Domain.Entities;
class Program { static void Main() { var cart = new Cart(Guid.NewGuid()); Console.WriteLine("Is items null? " + (cart.Items == null)); } }
