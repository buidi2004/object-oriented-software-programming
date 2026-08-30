using System;
using System.Threading;
using System.Threading.Tasks;
using Docker.DotNet;
using Docker.DotNet.Models;

class Program
{
    static async Task Main()
    {
        var client = new DockerClientConfiguration(new Uri("unix:///var/run/docker.sock")).CreateClient();
        Console.WriteLine("Pulling image...");
        try {
            await client.Images.CreateImageAsync(
                new ImagesCreateParameters { FromImage = "lscr.io/linuxserver/openssh-server:latest" },
                null,
                new Progress<JSONMessage>(m => Console.WriteLine(m.Status)),
                CancellationToken.None);
            Console.WriteLine("Success!");
        } catch (Exception ex) {
            Console.WriteLine("Error: " + ex.Message);
        }
    }
}
