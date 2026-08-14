# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Cache restore dependencies (layer cache)
COPY ["CloudServiceStore.Domain/CloudServiceStore.Domain.csproj", "CloudServiceStore.Domain/"]
COPY ["CloudServiceStore.Application/CloudServiceStore.Application.csproj", "CloudServiceStore.Application/"]
COPY ["CloudServiceStore.Infrastructure/CloudServiceStore.Infrastructure.csproj", "CloudServiceStore.Infrastructure/"]
COPY ["CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj", "CloudServiceStore.WebApi/"]

# Use BuildKit cache mount for NuGet packages so packages are never re-downloaded
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore "CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj"

# Copy source files and publish directly with --no-restore
COPY . .
WORKDIR "/src/CloudServiceStore.WebApi"
RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish "CloudServiceStore.WebApi.csproj" -c Release -o /app/publish --no-restore /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "CloudServiceStore.WebApi.dll"]
