using System;
using System.Reflection;

class Program
{
    static void Main()
    {
        var asm = Assembly.LoadFrom("/root/.nuget/packages/docker.dotnet.enhanced/4.3.3/lib/net10.0/Docker.DotNet.dll");
        foreach (var t in asm.GetExportedTypes())
        {
            if (t.Name.Contains("Docker") || t.Name.Contains("Client") || t.Name.Contains("Configuration"))
                Console.WriteLine(t.FullName);
        }
    }
}
