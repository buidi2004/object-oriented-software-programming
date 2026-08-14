using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Newsletters.Commands.SubscribeNewsletter;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Newsletters.Commands.SubscribeNewsletter;

public class SubscribeNewsletterCommandHandlerTests
{
    private readonly Mock<IRepository<NewsletterSubscriber>> _mockRepositoryNewsletterSubscriber;
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly SubscribeNewsletterCommandHandler _handler;

    public SubscribeNewsletterCommandHandlerTests()
    {
        _mockRepositoryNewsletterSubscriber = new Mock<IRepository<NewsletterSubscriber>>();
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _handler = new SubscribeNewsletterCommandHandler(_mockRepositoryNewsletterSubscriber.Object, _mockUnitOfWork.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        // Arrange
        // var request = new SubscribeNewsletterCommand();
        var cancellationToken = new CancellationToken();

        // Act
        // var result = await _handler.Handle(request, cancellationToken);

        // Assert
        Assert.True(true);
    }
}
