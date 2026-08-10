# Tối ưu hóa Build bằng Multi-stage build để siêu nhanh và nhẹ
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
# Cache restore dependencies
COPY ["CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj", "CloudServiceStore.WebApi/"]
COPY ["CloudServiceStore.Application/CloudServiceStore.Application.csproj", "CloudServiceStore.Application/"]
COPY ["CloudServiceStore.Domain/CloudServiceStore.Domain.csproj", "CloudServiceStore.Domain/"]
COPY ["CloudServiceStore.Infrastructure/CloudServiceStore.Infrastructure.csproj", "CloudServiceStore.Infrastructure/"]
RUN dotnet restore "CloudServiceStore.WebApi/CloudServiceStore.WebApi.csproj"

# Build project
COPY . .
WORKDIR "/src/CloudServiceStore.WebApi"
RUN dotnet build "CloudServiceStore.WebApi.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CloudServiceStore.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CloudServiceStore.WebApi.dll"]
