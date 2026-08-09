using System;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Exceptions;
using CloudServiceStore.Application.Features.Newsletters.Commands.SubscribeNewsletter;
using CloudServiceStore.Application.Features.Newsletters.Commands.UnsubscribeNewsletter;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.Newsletters;

public class NewsletterCommandHandlerTests
{
    private readonly Mock<IRepository<NewsletterSubscriber>> _repoMock = new();
    private readonly Mock<IUnitOfWork> _uowMock = new();

    [Fact]
    public async Task Subscribe_NewEmail_AddsSubscriber()
    {
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<NewsletterSubscriber, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((NewsletterSubscriber?)null);

        var handler = new SubscribeNewsletterCommandHandler(_repoMock.Object, _uowMock.Object);
        var result = await handler.Handle(new SubscribeNewsletterCommand { Email = "test@test.com" }, CancellationToken.None);

        Assert.True(result);
        _repoMock.Verify(r => r.AddAsync(It.Is<NewsletterSubscriber>(x => x.Email == "test@test.com" && x.IsActive), It.IsAny<CancellationToken>()), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Subscribe_ExistingActive_ThrowsConflictException()
    {
        var sub = new NewsletterSubscriber { Email = "test@test.com", IsActive = true };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<NewsletterSubscriber, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(sub);

        var handler = new SubscribeNewsletterCommandHandler(_repoMock.Object, _uowMock.Object);
        await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(new SubscribeNewsletterCommand { Email = "test@test.com" }, CancellationToken.None));
    }

    [Fact]
    public async Task Subscribe_ExistingInactive_Reactivates()
    {
        var sub = new NewsletterSubscriber { Email = "test@test.com", IsActive = false };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<NewsletterSubscriber, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(sub);

        var handler = new SubscribeNewsletterCommandHandler(_repoMock.Object, _uowMock.Object);
        var result = await handler.Handle(new SubscribeNewsletterCommand { Email = "test@test.com" }, CancellationToken.None);

        Assert.True(result);
        Assert.True(sub.IsActive);
        _repoMock.Verify(r => r.Update(sub), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Unsubscribe_NotFoundOrInactive_ThrowsNotFoundException()
    {
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<NewsletterSubscriber, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((NewsletterSubscriber?)null);

        var handler = new UnsubscribeNewsletterCommandHandler(_repoMock.Object, _uowMock.Object);
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new UnsubscribeNewsletterCommand { Email = "test@test.com" }, CancellationToken.None));
    }

    [Fact]
    public async Task Unsubscribe_Active_Deactivates()
    {
        var sub = new NewsletterSubscriber { Email = "test@test.com", IsActive = true };
        _repoMock.Setup(r => r.FirstOrDefaultAsync(It.IsAny<Expression<Func<NewsletterSubscriber, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(sub);

        var handler = new UnsubscribeNewsletterCommandHandler(_repoMock.Object, _uowMock.Object);
        var result = await handler.Handle(new UnsubscribeNewsletterCommand { Email = "test@test.com" }, CancellationToken.None);

        Assert.True(result);
        Assert.False(sub.IsActive);
        _repoMock.Verify(r => r.Update(sub), Times.Once);
        _uowMock.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
