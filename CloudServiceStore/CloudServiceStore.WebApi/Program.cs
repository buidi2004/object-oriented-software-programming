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
using CloudServiceStore.Infrastructure.ExternalServices.QrCode;
using CloudServiceStore.Application.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("login", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(15);
        opt.QueueLimit = 0;
    });

    options.OnRejected = async (context, ct) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsync("Quá nhiều lần thử, thử lại sau.", ct);
    };
});


builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("https://your-frontend-domain.com")
              .AllowCredentials()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddSingleton<IQrCodeGeneratorFactory, QrCodeGeneratorFactory>();
builder.Services.AddControllers();

builder.Services.AddDbContext<CloudServiceStore.Infrastructure.Persistence.AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddSingleton<CloudServiceStore.Domain.Interfaces.IDapperContext, CloudServiceStore.Infrastructure.Dapper.DapperContext>();

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CloudServiceStore.Application.AssemblyMarker).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(CloudServiceStore.Application.AssemblyMarker).Assembly);

builder.Services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(CloudServiceStore.Application.Behaviors.ValidationBehavior<,>));
builder.Services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(CloudServiceStore.Application.Behaviors.LoggingBehavior<,>));
builder.Services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(CloudServiceStore.Application.Behaviors.CachingBehavior<,>));
builder.Services.AddTransient(typeof(MediatR.IPipelineBehavior<,>), typeof(CloudServiceStore.Application.Behaviors.PerformanceBehavior<,>));



builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection(JwtSettings.SectionName));
builder.Services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();

// JWT Bearer Configuration
var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>();
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
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseMiddleware<CloudServiceStore.WebApi.Middlewares.ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();

app.UseRateLimiter();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
