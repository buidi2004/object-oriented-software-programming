using CloudServiceStore.Application.Features.Auth.Commands.Register;
using FluentAssertions;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Auth;

public class RegisterCommandValidatorTests
{
    private readonly RegisterCommandValidator _validator = new();

    [Fact]
    public void Should_Fail_When_Password_Too_Short()
    {
        var command = new RegisterCommand("A", "a@test.com", "123", null);
        _validator.Validate(command).IsValid.Should().BeFalse();
    }

    [Fact]
    public void Should_Pass_With_Valid_Data()
    {
        var command = new RegisterCommand("Nguyễn Văn A", "a@test.com", "Password123", "0912345678");
        _validator.Validate(command).IsValid.Should().BeTrue();
    }
}
