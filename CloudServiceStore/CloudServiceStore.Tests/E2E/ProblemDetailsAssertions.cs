using System.Net;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;

namespace CloudServiceStore.Tests.E2E;

public static class ProblemDetailsAssertions
{
    public static async Task<ProblemDetails> ShouldBeProblemDetailsAsync(
        this HttpResponseMessage response,
        HttpStatusCode expectedStatus,
        string? expectedTitle = null)
    {
        response.StatusCode.Should().Be(expectedStatus);

        var contentType = response.Content.Headers.ContentType?.MediaType;
        contentType.Should().BeOneOf("application/problem+json", "application/json");

        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>();
        problem.Should().NotBeNull();
        problem!.Status.Should().Be((int)expectedStatus);

        if (!string.IsNullOrWhiteSpace(expectedTitle))
        {
            problem.Title.Should().Be(expectedTitle);
        }
        else
        {
            (problem.Detail != null || problem.Title != null).Should().BeTrue();
        }

        return problem;
    }
}
