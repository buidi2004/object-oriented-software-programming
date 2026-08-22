using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using CloudServiceStore.Application.Features.Dashboard.Queries.ExportRevenueStats;
using CloudServiceStore.Application.Features.NewsArticles.Commands.AddComment;
using CloudServiceStore.Application.Features.NewsArticles.Commands.ApproveComment;
using CloudServiceStore.Application.Features.NewsArticles.Queries.GetComments;
using CloudServiceStore.Application.Features.Orders.Commands.GetControlPanelAccessToken;
using CloudServiceStore.Application.Features.Permissions.Commands.UpdateRolePermissions;
using CloudServiceStore.Application.Features.Permissions.Queries.GetAllPermissions;
using CloudServiceStore.Application.Features.RecentlyViewed.Commands.AddRecentlyViewed;
using CloudServiceStore.Application.Features.RecentlyViewed.Queries.GetMyRecentlyViewed;
using CloudServiceStore.Application.Features.Search.Queries.GlobalSearch;
using CloudServiceStore.Application.Features.SEO.Queries.GenerateSitemap;
using CloudServiceStore.Application.Features.Settings.Commands.UpdateSetting;
using CloudServiceStore.Application.Features.Settings.Queries.GetAllSettings;
using CloudServiceStore.Application.Interfaces;
using CloudServiceStore.Domain.Entities;
using CloudServiceStore.Domain.Enums;
using CloudServiceStore.Domain.Interfaces;
using FluentAssertions;
using Moq;
using Xunit;

namespace CloudServiceStore.Tests.Application.Features.GroupC
{
    public class GroupCFeaturesTests
    {
        [Fact]
        public async Task GetControlPanelAccessToken_ValidOrder_ReturnsToken()
        {
            var repo = new Mock<IRepository<OrderRequest>>();
            var userSvc = new Mock<ICurrentUserService>();
            var userId = Guid.NewGuid();
            var orderId = Guid.NewGuid();

            var order = new OrderRequest(userId, new List<OrderItem>(), null, 0m, 100m, false);
            typeof(OrderRequest).GetProperty("Id")!.SetValue(order, orderId);
            typeof(OrderRequest).GetProperty("Status")!.SetValue(order, OrderStatus.Paid);

            repo.Setup(x => x.GetByIdAsync(orderId, It.IsAny<CancellationToken>())).ReturnsAsync(order);
            userSvc.Setup(x => x.UserId).Returns(userId);

            var handler = new GetControlPanelAccessTokenCommandHandler(repo.Object, userSvc.Object);
            var result = await handler.Handle(new GetControlPanelAccessTokenCommand(orderId), CancellationToken.None);

            result.Should().NotBeNull();
            result.Should().StartWith("cp_token_");
        }

        [Fact]
        public async Task AddComment_ValidCommand_ReturnsGuid()
        {
            var commentRepo = new Mock<IRepository<ArticleComment>>();
            var articleRepo = new Mock<IRepository<NewsArticle>>();
            var userSvc = new Mock<ICurrentUserService>();

            var articleId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            var article = new NewsArticle("T", "s", "c", userId);
            articleRepo.Setup(x => x.GetByIdAsync(articleId, It.IsAny<CancellationToken>())).ReturnsAsync(article);
            userSvc.Setup(x => x.UserId).Returns(userId);

            var handler = new AddCommentCommandHandler(commentRepo.Object, articleRepo.Object, userSvc.Object);
            var result = await handler.Handle(new AddCommentCommand { NewsArticleId = articleId, Content = "Great" }, CancellationToken.None);

            result.Should().NotBeEmpty();
            commentRepo.Verify(x => x.AddAsync(It.IsAny<ArticleComment>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task ApproveComment_ValidId_ReturnsTrue()
        {
            var commentRepo = new Mock<IRepository<ArticleComment>>();
            var comment = new ArticleComment(Guid.NewGuid(), Guid.NewGuid(), "test");
            commentRepo.Setup(x => x.GetByIdAsync(comment.Id, It.IsAny<CancellationToken>())).ReturnsAsync(comment);

            var handler = new ApproveCommentCommandHandler(commentRepo.Object);
            var result = await handler.Handle(new ApproveCommentCommand(comment.Id), CancellationToken.None);

            result.Should().BeTrue();
            comment.IsApproved.Should().BeTrue();
            commentRepo.Verify(x => x.Update(comment), Times.Once);
        }

        [Fact]
        public async Task GlobalSearch_ReturnsMatches()
        {
            var planRepo = new Mock<IRepository<ServicePlan>>();
            var newsRepo = new Mock<IRepository<NewsArticle>>();
            var faqRepo = new Mock<IRepository<FaqItem>>();
            var kbRepo = new Mock<IRepository<KnowledgeBaseArticle>>();

            var plan = new ServicePlan(Guid.NewGuid(), "Cloud Plan XYZ", "2 Core", "4GB", "50GB", "1Gbps", null);
            planRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<ServicePlan> { plan });
            
            newsRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<NewsArticle, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<NewsArticle>());
            faqRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<FaqItem, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<FaqItem>());
            kbRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<KnowledgeBaseArticle, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<KnowledgeBaseArticle>());

            var handler = new GlobalSearchQueryHandler(planRepo.Object, newsRepo.Object, faqRepo.Object, kbRepo.Object);
            var result = await handler.Handle(new GlobalSearchQuery("xyz"), CancellationToken.None);

            result.ServicePlans.Should().HaveCount(1);
            result.NewsArticles.Should().BeEmpty();
        }

        [Fact]
        public async Task ExportRevenueStats_ReturnsCsv()
        {
            var repo = new Mock<IRepository<OrderRequest>>();
            repo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<OrderRequest, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<OrderRequest>());

            var handler = new ExportRevenueStatsQueryHandler(repo.Object);
            var bytes = await handler.Handle(new ExportRevenueStatsQuery("csv"), CancellationToken.None);

            var content = System.Text.Encoding.UTF8.GetString(bytes);
            content.Should().Contain("OrderId,ServicePlanId,TotalAmount,CreatedAt");
        }

        [Fact]
        public async Task GenerateSitemap_ReturnsXml()
        {
            var planRepo = new Mock<IRepository<ServicePlan>>();
            var newsRepo = new Mock<IRepository<NewsArticle>>();

            planRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<ServicePlan, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<ServicePlan>());
            newsRepo.Setup(x => x.WhereAsync(It.IsAny<System.Linq.Expressions.Expression<Func<NewsArticle, bool>>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<NewsArticle>());

            var handler = new GenerateSitemapQueryHandler(planRepo.Object, newsRepo.Object);
            var xml = await handler.Handle(new GenerateSitemapQuery(), CancellationToken.None);

            xml.Should().Contain("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");
        }
    }
}
