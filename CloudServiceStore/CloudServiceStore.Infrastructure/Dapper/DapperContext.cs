using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using CloudServiceStore.Domain.Interfaces;

namespace CloudServiceStore.Infrastructure.Dapper;

public class DapperContext : IDapperContext
{
    private readonly string _connectionString;
    public DapperContext(IConfiguration config)
        => _connectionString = config.GetConnectionString("DefaultConnection")!;

    public IDbConnection CreateConnection() => new SqlConnection(_connectionString);
}
