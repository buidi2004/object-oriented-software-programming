using CloudServiceStore.WebApi.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using System;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CloudServiceStore.Infrastructure.Security;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Application;
using CloudServiceStore.Application.Configuration;
using CloudServiceStore.Infrastructure;
using Hangfire;

using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName);
});

builder.Services.AddTransient<IResourceStatusNotifier, SignalRResourceStatusNotifier>();

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("login", httpContext =>
    {
        var clientIp = httpContext.Connection.RemoteIpAddress?.ToString() 
                       ?? httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault() 
                       ?? "unknown";

        var isDevOrTest = builder.Environment.IsDevelopment() || builder.Environment.IsEnvironment("Testing");

        return RateLimitPartition.GetFixedWindowLimiter(
            clientIp,
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = isDevOrTest ? 1000 : 5,
                Window = TimeSpan.FromMinutes(15),
                QueueLimit = 0
            });
    });

    options.OnRejected = async (context, ct) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/json";
        await context.HttpContext.Response.WriteAsync("{\"message\": \"Quá nhiều lần thử từ IP này. Vui lòng thử lại sau 15 phút.\"}", ct);
    };
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("https://your-frontend-domain.com", "http://localhost:3000", "https://object-oriented-software-programmin-sable.vercel.app")
              .SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost" || origin.EndsWith(".vercel.app"))
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.Configure<FrontendSettings>(builder.Configuration.GetSection(FrontendSettings.SectionName));
builder.Services.Configure<VpsSettings>(builder.Configuration.GetSection(VpsSettings.SectionName));

// Hangfire configuration
builder.Services.AddHangfire(config => config.UseInMemoryStorage());
builder.Services.AddHangfireServer();

// SignalR
builder.Services.AddSignalR();
builder.Services.AddHealthChecks();

// JWT Bearer Configuration
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>() ?? new JwtSettings();
builder.Services.AddAuthentication(defaultScheme: JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Seed Database
using (var scope = app.Services.CreateScope())
{
    await CloudServiceStore.Infrastructure.Persistence.DbSeeder.SeedAsync(scope.ServiceProvider);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<CloudServiceStore.WebApi.Middlewares.ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

var imagesDirectory = System.IO.Path.Combine(app.Environment.ContentRootPath, "images");
if (!System.IO.Directory.Exists(imagesDirectory))
{
    System.IO.Directory.CreateDirectory(imagesDirectory);
}

app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(imagesDirectory),
    RequestPath = "/images"
});

app.UseRateLimiter();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    // Authorization = new[] { new HangfireCustomBasicAuthenticationFilter{ ... } } // Should protect this in production
});

app.MapControllers();
app.MapHub<CloudServiceStore.WebApi.Hubs.VpsTerminalHub>("/hubs/vps-terminal");
app.MapHub<CloudServiceStore.WebApi.Hubs.LiveChatHub>("/hubs/chat");
app.MapHub<CloudServiceStore.WebApi.Hubs.ResourceStatusHub>("/hubs/resource-status");
app.MapHealthChecks("/health");

// Let's Encrypt ACME HTTP-01 Challenge Endpoint (bypasses auth and rate limit)
app.MapGet("/.well-known/acme-challenge/{token}", (string token, CloudServiceStore.Application.Interfaces.IAcmeChallengeStore store) =>
{
    var keyAuthz = store.GetChallenge(token);
    return string.IsNullOrEmpty(keyAuthz)
        ? Microsoft.AspNetCore.Http.Results.NotFound()
        : Microsoft.AspNetCore.Http.Results.Text(keyAuthz, "text/plain");
}).AllowAnonymous().DisableRateLimiting();

// Test email endpoint (development only)
if (app.Environment.IsDevelopment())
{
    app.MapGet("/test-email", async (IEmailService emailService, string? to) =>
    {
        var toEmail = to ?? "buidi7170@gmail.com";
        await emailService.SendEmailAsync(
            toEmail,
            "🧪 Test Email từ CloudHost VN",
            "<h2>Xin chào!</h2><p>Nếu bạn đọc được mail này, tích hợp Gmail SMTP đã thành công 🎉</p><p>Gửi lúc: " + DateTime.UtcNow.ToString("HH:mm:ss dd/MM/yyyy") + " UTC</p>"
        );
        return Results.Ok(new { success = true, message = $"Email sent to {toEmail}" });
    });
}

app.Run();
public partial class Program { }
