using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using CloudServiceStore.Application.DTOs;
using CloudServiceStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.E2E;

public class AdminDatabasesE2ETests : BaseE2ETest
{
    public AdminDatabasesE2ETests(E2EWebApplicationFactory factory) : base(factory)
    {
    }

    [Fact]
    public async Task AdminDatabases_Customer_CannotAccess()
    {
        // Arrange
        var token = await RegisterAndLoginCustomerAsync("db_cust@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await Client.GetAsync("/api/admin/databases");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task AdminDatabases_Admin_CanAccessAndSeeDatabases()
    {
        // Arrange
        // Create an admin
        var adminToken = await RegisterAndLoginAdminAsync("admin_db_tester@test.com", "Password123!");
        Client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);

        // Act
        var response = await Client.GetAsync("/api/admin/databases");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var databases = await response.Content.ReadFromJsonAsync<List<AdminDatabaseDto>>();
        databases.Should().NotBeNull();
    }
}
