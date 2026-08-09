using System.IO;
using System.Text.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.WebApi.Middlewares;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.WebApi.Middlewares;

public class ExceptionHandlingMiddlewareTests
{
    private readonly Mock<ILogger<ExceptionHandlingMiddleware>> _loggerMock = new();
    
    [Fact]
    public async Task InvokeAsync_UnauthorizedException_Returns401()
    {
        var middleware = new ExceptionHandlingMiddleware(
            innerHttpContext => throw new UnauthorizedException("Unauthorized access"),
            _loggerMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(StatusCodes.Status401Unauthorized);
        
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(context.Response.Body).ReadToEndAsync();
        
        responseBody.Should().Contain("Unauthorized access");
        responseBody.Should().Contain("Unauthorized");
    }

    [Fact]
    public async Task InvokeAsync_ConflictException_Returns409()
    {
        var middleware = new ExceptionHandlingMiddleware(
            innerHttpContext => throw new ConflictException("Conflict occurred"),
            _loggerMock.Object);

        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        await middleware.InvokeAsync(context);

        context.Response.StatusCode.Should().Be(StatusCodes.Status409Conflict);
    }
}
