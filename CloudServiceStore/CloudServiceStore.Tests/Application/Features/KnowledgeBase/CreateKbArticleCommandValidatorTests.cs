using CloudServiceStore.Application.Features.KnowledgeBase.Commands.Create;
using FluentValidation.TestHelper;
using Xunit;
using System;

namespace CloudServiceStore.Tests.Application.Features.KnowledgeBase;

public class CreateKbArticleCommandValidatorTests
{
    private readonly CreateKbArticleCommandValidator _validator;

    public CreateKbArticleCommandValidatorTests()
    {
        _validator = new CreateKbArticleCommandValidator();
    }

    [Fact]
    public void Validate_ValidCommand_ShouldNotHaveAnyErrors()
    {
        var command = new CreateKbArticleCommand("How to use VPN?", "how-to-use-vpn", new string('a', 50), "Network", Guid.NewGuid(), true);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_ShortContent_ShouldHaveError()
    {
        var command = new CreateKbArticleCommand("Title", "slug", "short", "Network", Guid.NewGuid(), true);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Content);
    }

    [Fact]
    public void Validate_EmptyTitle_ShouldHaveError()
    {
        var command = new CreateKbArticleCommand("", "slug", new string('a', 50), "Network", Guid.NewGuid(), true);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }
}
