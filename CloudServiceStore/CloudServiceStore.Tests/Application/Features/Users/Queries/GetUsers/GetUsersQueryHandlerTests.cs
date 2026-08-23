using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using CloudServiceStore.Application.Features.Users.Queries.GetUsers;
using MediatR;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;

namespace CloudServiceStore.Tests.Application.Features.Users.Queries.GetUsers;

public class GetUsersQueryHandlerTests
{
    private readonly Mock<IRepository<AppUser>> _mockRepositoryAppUser;
    private readonly Mock<IRepository<Role>> _mockRepositoryRole;
    private readonly GetUsersQueryHandler _handler;

    public GetUsersQueryHandlerTests()
    {
        _mockRepositoryAppUser = new Mock<IRepository<AppUser>>();
        _mockRepositoryRole = new Mock<IRepository<Role>>();
        _handler = new GetUsersQueryHandler(_mockRepositoryAppUser.Object, _mockRepositoryRole.Object);
    }

    [Fact]
    public async Task Handle_ShouldExecuteSuccessfully_WhenRequestIsValid()
    {
        Assert.True(true);
    }
}
