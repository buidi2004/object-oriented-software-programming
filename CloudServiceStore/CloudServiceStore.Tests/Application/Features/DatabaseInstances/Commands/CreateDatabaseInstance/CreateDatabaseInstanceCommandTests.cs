using System.Threading.Tasks;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.DatabaseInstances.Commands.CreateDatabaseInstance
{
    public class CreateDatabaseInstanceCommandTests
    {
        [Fact]
        public void DatabaseInstance_ShouldSetCorrectPort_ForMySQL()
        {
            var instance = new DatabaseInstance
            {
                Name = "TestDB",
                Engine = DatabaseEngine.MySQL
            };

            instance.Port.Should().Be(3306);
            instance.Version.Should().BeEmpty();
            instance.Status.Should().Be(DatabaseInstanceStatus.Creating);
        }

        [Fact]
        public void DatabaseInstance_ShouldSetCorrectPort_ForPostgreSQL()
        {
            var instance = new DatabaseInstance
            {
                Name = "TestDB",
                Engine = DatabaseEngine.PostgreSQL
            };

            instance.Port.Should().Be(5432);
        }
    }
}
