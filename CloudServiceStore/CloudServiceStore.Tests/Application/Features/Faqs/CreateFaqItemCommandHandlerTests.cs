using CloudServiceStore.Application.Features.Faqs.Commands.CreateFaqItem;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CloudServiceStore.Tests.Application.Features.Faqs;

public class CreateFaqItemCommandHandlerTests
{
    private readonly Mock<IRepository<FaqItem>> _faqRepositoryMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ICatalogCache> _catalogCacheMock;
    private readonly CreateFaqItemCommandHandler _handler;

    public CreateFaqItemCommandHandlerTests()
    {
        _faqRepositoryMock = new Mock<IRepository<FaqItem>>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _catalogCacheMock = new Mock<ICatalogCache>();
        _handler = new CreateFaqItemCommandHandler(
            _faqRepositoryMock.Object,
            _unitOfWorkMock.Object,
            _catalogCacheMock.Object);
    }

    [Fact]
    public async Task Handle_ValidRequest_ShouldCreateFaqAndReturnId()
    {
        // Arrange
        var command = new CreateFaqItemCommand("What is this?", "This is a test answer.", "General", 1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
        
        _faqRepositoryMock.Verify(x => x.AddAsync(It.Is<FaqItem>(f => 
            f.Question == "What is this?" &&
            f.Answer == "This is a test answer." &&
            f.CategoryTag == "General" &&
            f.DisplayOrder == 1)), Times.Once);

        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
