using CloudServiceStore.Application.Features.Auth.Commands.Login;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class LoginCommandValidatorTests
{
    private readonly LoginCommandValidator _validator = new();

    [Fact]
    public void Should_Fail_When_Email_Invalid()
    {
        var command = new LoginCommand("invalid-email", "Password123", "127.0.0.1", "Chrome", "PC");
        _validator.Validate(command).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Should_Pass_With_Valid_Data()
    {
        var command = new LoginCommand("a@test.com", "Password123", "127.0.0.1", "Chrome", "PC");
        _validator.Validate(command).IsValid.Should().BeTrue();
    }
}
