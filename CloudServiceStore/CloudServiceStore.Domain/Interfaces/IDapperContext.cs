using System.Data;

namespace CloudServiceStore.Domain.Interfaces;

public interface IDapperContext
{
    IDbConnection CreateConnection();
}
