using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;

namespace CloudServiceStore.WebApi.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        int statusCode = StatusCodes.Status500InternalServerError;
        string type = "https://tools.ietf.org/html/rfc7231#section-6.6.1";
        string title = "An internal server error occurred.";
        string detail = exception.Message + (exception.InnerException != null ? " Inner: " + exception.InnerException.Message : "");
        
        if (exception is UnauthorizedException || exception is UnauthorizedAccessException)
        {
            statusCode = StatusCodes.Status401Unauthorized;
            type = "https://tools.ietf.org/html/rfc7235#section-3.1";
            title = "Unauthorized";
        }
        else if (exception is NotFoundException)
        {
            statusCode = StatusCodes.Status404NotFound;
            type = "https://tools.ietf.org/html/rfc7231#section-6.5.4";
            title = "Not Found";
        }
        else if (exception is ConflictException)
        {
            statusCode = StatusCodes.Status409Conflict;
            type = "https://tools.ietf.org/html/rfc7231#section-6.5.8";
            title = "Conflict";
        }
        else if (exception is ArgumentException || exception is ArgumentNullException || exception is BadRequestException || exception is FluentValidation.ValidationException)
        {
            statusCode = StatusCodes.Status400BadRequest;
            type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
            title = "Bad Request";
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Type = type,
            Detail = detail,
            Instance = context.Request.Path
        };

        var json = JsonSerializer.Serialize(problemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
