using System;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.ServiceTagNotes.Commands.UpdateServiceTagNote;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Interfaces;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.ServiceTagNotes.Commands.UpdateServiceTagNote;

public class UpdateServiceTagNoteCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenNotExists_ShouldCreateNote()
    {
        var userId = Guid.NewGuid();
        var serviceId = Guid.NewGuid();

        var uow = new Mock<IUnitOfWork>();
        var repo = new Mock<IRepository<ServiceTagNote>>();
        var currentUser = new Mock<ICurrentUserService>();

        currentUser.Setup(x => x.UserId).Returns(userId);
        repo.Setup(x => x.FirstOrDefaultAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ServiceTagNote, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((ServiceTagNote?)null);

        var handler = new UpdateServiceTagNoteCommandHandler(uow.Object, repo.Object, currentUser.Object);

        await handler.Handle(new UpdateServiceTagNoteCommand("vps", serviceId, "[\"Prod\"]", "#ff0000", "main node"), CancellationToken.None);

        repo.Verify(x => x.AddAsync(It.IsAny<ServiceTagNote>(), It.IsAny<CancellationToken>()), Times.Once);
        uow.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
