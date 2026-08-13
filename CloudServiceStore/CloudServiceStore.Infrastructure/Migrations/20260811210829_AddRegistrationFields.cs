using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistrationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AffiliateApplications_AppUsers_UserId",
                table: "AffiliateApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_AppUsers_Roles_RoleId",
                table: "AppUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_AppUsers_UserId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_BackupJobs_OrderRequests_OrderRequestId",
                table: "BackupJobs");

            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_Carts_CartId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_ServicePlans_ServicePlanId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Carts_AppUsers_UserId",
                table: "Carts");

            migrationBuilder.DropForeignKey(
                name: "FK_DnsRecords_DomainRecords_DomainId",
                table: "DnsRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_DomainRecords_OrderRequests_OrderRequestId",
                table: "DomainRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_OrderRequests_OrderId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginHistories_AppUsers_UserId",
                table: "LoginHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_AppUsers_UserId",
                table: "LoyaltyPoints");

            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyTransactions_AppUsers_UserId",
                table: "LoyaltyTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_NewsArticles_AppUsers_AuthorId",
                table: "NewsArticles");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationSettings_AppUsers_UserId",
                table: "NotificationSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_Coupons_CouponId",
                table: "OrderRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_OrderRequests_OrderId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PlanPrices_ServicePlans_ServicePlanId",
                table: "PlanPrices");

            migrationBuilder.DropForeignKey(
                name: "FK_Promotions_ServicePlans_ServicePlanId",
                table: "Promotions");

            migrationBuilder.DropForeignKey(
                name: "FK_ReferralCodes_AppUsers_UserId",
                table: "ReferralCodes");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_AppUsers_UserId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ServicePlans_ServicePlanId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_SavedPaymentMethods_AppUsers_UserId",
                table: "SavedPaymentMethods");

            migrationBuilder.DropForeignKey(
                name: "FK_ServicePlans_ServiceCategories_CategoryId",
                table: "ServicePlans");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceStatusLogs_OrderRequests_OrderRequestId",
                table: "ServiceStatusLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceStatusLogs_ServicePlans_ServicePlanId",
                table: "ServiceStatusLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_SslCertificates_DomainRecords_DomainId",
                table: "SslCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportTickets_AppUsers_AssignedStaffId",
                table: "SupportTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportTickets_AppUsers_UserId",
                table: "SupportTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketMessages_AppUsers_SenderId",
                table: "TicketMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketMessages_SupportTickets_TicketId",
                table: "TicketMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSessions_AppUsers_UserId",
                table: "UserSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_WishlistItems_AppUsers_UserId",
                table: "WishlistItems");

            migrationBuilder.DropForeignKey(
                name: "FK_WishlistItems_ServicePlans_ServicePlanId",
                table: "WishlistItems");

            migrationBuilder.AddColumn<string>(
                name: "AddressLine",
                table: "AppUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "AppUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "AppUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "AppUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "AppUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "AppUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TaxCode",
                table: "AppUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ward",
                table: "AppUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ArticleComments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ArticleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArticleComments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ArticleComments_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ArticleComments_NewsArticles_ArticleId",
                        column: x => x.ArticleId,
                        principalTable: "NewsArticles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CartReminders",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CartId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartReminders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartReminders_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CartReminders_Carts_CartId",
                        column: x => x.CartId,
                        principalTable: "Carts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChatSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatSessions_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ControlPanelCredentials",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PanelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Url = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Password = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ControlPanelCredentials", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "KnowledgeBaseArticles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CategoryTag = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    ViewCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    AuthorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KnowledgeBaseArticles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KnowledgeBaseArticles_AppUsers_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RecentlyViewedItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServicePlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ViewedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecentlyViewedItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecentlyViewedItems_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecentlyViewedItems_ServicePlans_ServicePlanId",
                        column: x => x.ServicePlanId,
                        principalTable: "ServicePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "VpsInstances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContainerId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContainerName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VpsInstances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VpsInstances_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VpsInstances_OrderRequests_OrderId",
                        column: x => x.OrderId,
                        principalTable: "OrderRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SenderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessages_AppUsers_SenderId",
                        column: x => x.SenderId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ChatMessages_ChatSessions_SessionId",
                        column: x => x.SessionId,
                        principalTable: "ChatSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PermissionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ArticleComments_ArticleId",
                table: "ArticleComments",
                column: "ArticleId");

            migrationBuilder.CreateIndex(
                name: "IX_ArticleComments_UserId",
                table: "ArticleComments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CartReminders_CartId",
                table: "CartReminders",
                column: "CartId");

            migrationBuilder.CreateIndex(
                name: "IX_CartReminders_UserId",
                table: "CartReminders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderId",
                table: "ChatMessages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SessionId",
                table: "ChatMessages",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatSessions_UserId",
                table: "ChatSessions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeBaseArticles_AuthorId",
                table: "KnowledgeBaseArticles",
                column: "AuthorId");

            migrationBuilder.CreateIndex(
                name: "IX_KnowledgeBaseArticles_Slug",
                table: "KnowledgeBaseArticles",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecentlyViewedItems_ServicePlanId",
                table: "RecentlyViewedItems",
                column: "ServicePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_RecentlyViewedItems_UserId",
                table: "RecentlyViewedItems",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_PermissionId",
                table: "RolePermissions",
                column: "PermissionId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_VpsInstances_OrderId",
                table: "VpsInstances",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_VpsInstances_UserId",
                table: "VpsInstances",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AffiliateApplications_AppUsers_UserId",
                table: "AffiliateApplications",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppUsers_Roles_RoleId",
                table: "AppUsers",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_AppUsers_UserId",
                table: "AuditLogs",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BackupJobs_OrderRequests_OrderRequestId",
                table: "BackupJobs",
                column: "OrderRequestId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_Carts_CartId",
                table: "CartItems",
                column: "CartId",
                principalTable: "Carts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_ServicePlans_ServicePlanId",
                table: "CartItems",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_AppUsers_UserId",
                table: "Carts",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DnsRecords_DomainRecords_DomainId",
                table: "DnsRecords",
                column: "DomainId",
                principalTable: "DomainRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DomainRecords_OrderRequests_OrderRequestId",
                table: "DomainRecords",
                column: "OrderRequestId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_OrderRequests_OrderId",
                table: "Invoices",
                column: "OrderId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LoginHistories_AppUsers_UserId",
                table: "LoginHistories",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_AppUsers_UserId",
                table: "LoyaltyPoints",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyTransactions_AppUsers_UserId",
                table: "LoyaltyTransactions",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NewsArticles_AppUsers_AuthorId",
                table: "NewsArticles",
                column: "AuthorId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationSettings_AppUsers_UserId",
                table: "NotificationSettings",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequests_Coupons_CouponId",
                table: "OrderRequests",
                column: "CouponId",
                principalTable: "Coupons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_OrderRequests_OrderId",
                table: "Payments",
                column: "OrderId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanPrices_ServicePlans_ServicePlanId",
                table: "PlanPrices",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Promotions_ServicePlans_ServicePlanId",
                table: "Promotions",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ReferralCodes_AppUsers_UserId",
                table: "ReferralCodes",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_AppUsers_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ServicePlans_ServicePlanId",
                table: "Reviews",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SavedPaymentMethods_AppUsers_UserId",
                table: "SavedPaymentMethods",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServicePlans_ServiceCategories_CategoryId",
                table: "ServicePlans",
                column: "CategoryId",
                principalTable: "ServiceCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceStatusLogs_OrderRequests_OrderRequestId",
                table: "ServiceStatusLogs",
                column: "OrderRequestId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceStatusLogs_ServicePlans_ServicePlanId",
                table: "ServiceStatusLogs",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SslCertificates_DomainRecords_DomainId",
                table: "SslCertificates",
                column: "DomainId",
                principalTable: "DomainRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTickets_AppUsers_AssignedStaffId",
                table: "SupportTickets",
                column: "AssignedStaffId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTickets_AppUsers_UserId",
                table: "SupportTickets",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketMessages_AppUsers_SenderId",
                table: "TicketMessages",
                column: "SenderId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketMessages_SupportTickets_TicketId",
                table: "TicketMessages",
                column: "TicketId",
                principalTable: "SupportTickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSessions_AppUsers_UserId",
                table: "UserSessions",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WishlistItems_AppUsers_UserId",
                table: "WishlistItems",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_WishlistItems_ServicePlans_ServicePlanId",
                table: "WishlistItems",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AffiliateApplications_AppUsers_UserId",
                table: "AffiliateApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_AppUsers_Roles_RoleId",
                table: "AppUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_AppUsers_UserId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_BackupJobs_OrderRequests_OrderRequestId",
                table: "BackupJobs");

            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_Carts_CartId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_ServicePlans_ServicePlanId",
                table: "CartItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Carts_AppUsers_UserId",
                table: "Carts");

            migrationBuilder.DropForeignKey(
                name: "FK_DnsRecords_DomainRecords_DomainId",
                table: "DnsRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_DomainRecords_OrderRequests_OrderRequestId",
                table: "DomainRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_OrderRequests_OrderId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginHistories_AppUsers_UserId",
                table: "LoginHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyPoints_AppUsers_UserId",
                table: "LoyaltyPoints");

            migrationBuilder.DropForeignKey(
                name: "FK_LoyaltyTransactions_AppUsers_UserId",
                table: "LoyaltyTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_NewsArticles_AppUsers_AuthorId",
                table: "NewsArticles");

            migrationBuilder.DropForeignKey(
                name: "FK_NotificationSettings_AppUsers_UserId",
                table: "NotificationSettings");

            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_Coupons_CouponId",
                table: "OrderRequests");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_OrderRequests_OrderId",
                table: "Payments");

            migrationBuilder.DropForeignKey(
                name: "FK_PlanPrices_ServicePlans_ServicePlanId",
                table: "PlanPrices");

            migrationBuilder.DropForeignKey(
                name: "FK_Promotions_ServicePlans_ServicePlanId",
                table: "Promotions");

            migrationBuilder.DropForeignKey(
                name: "FK_ReferralCodes_AppUsers_UserId",
                table: "ReferralCodes");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_AppUsers_UserId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_ServicePlans_ServicePlanId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_SavedPaymentMethods_AppUsers_UserId",
                table: "SavedPaymentMethods");

            migrationBuilder.DropForeignKey(
                name: "FK_ServicePlans_ServiceCategories_CategoryId",
                table: "ServicePlans");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceStatusLogs_OrderRequests_OrderRequestId",
                table: "ServiceStatusLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_ServiceStatusLogs_ServicePlans_ServicePlanId",
                table: "ServiceStatusLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_SslCertificates_DomainRecords_DomainId",
                table: "SslCertificates");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportTickets_AppUsers_AssignedStaffId",
                table: "SupportTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_SupportTickets_AppUsers_UserId",
                table: "SupportTickets");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketMessages_AppUsers_SenderId",
                table: "TicketMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_TicketMessages_SupportTickets_TicketId",
                table: "TicketMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_UserSessions_AppUsers_UserId",
                table: "UserSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_WishlistItems_AppUsers_UserId",
                table: "WishlistItems");

            migrationBuilder.DropForeignKey(
                name: "FK_WishlistItems_ServicePlans_ServicePlanId",
                table: "WishlistItems");

            migrationBuilder.DropTable(
                name: "ArticleComments");

            migrationBuilder.DropTable(
                name: "CartReminders");

            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "ControlPanelCredentials");

            migrationBuilder.DropTable(
                name: "KnowledgeBaseArticles");

            migrationBuilder.DropTable(
                name: "RecentlyViewedItems");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropTable(
                name: "VpsInstances");

            migrationBuilder.DropTable(
                name: "ChatSessions");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropColumn(
                name: "AddressLine",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "City",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "TaxCode",
                table: "AppUsers");

            migrationBuilder.DropColumn(
                name: "Ward",
                table: "AppUsers");

            migrationBuilder.AddForeignKey(
                name: "FK_AffiliateApplications_AppUsers_UserId",
                table: "AffiliateApplications",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppUsers_Roles_RoleId",
                table: "AppUsers",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_AppUsers_UserId",
                table: "AuditLogs",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BackupJobs_OrderRequests_OrderRequestId",
                table: "BackupJobs",
                column: "OrderRequestId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_Carts_CartId",
                table: "CartItems",
                column: "CartId",
                principalTable: "Carts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_ServicePlans_ServicePlanId",
                table: "CartItems",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_AppUsers_UserId",
                table: "Carts",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DnsRecords_DomainRecords_DomainId",
                table: "DnsRecords",
                column: "DomainId",
                principalTable: "DomainRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DomainRecords_OrderRequests_OrderRequestId",
                table: "DomainRecords",
                column: "OrderRequestId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_OrderRequests_OrderId",
                table: "Invoices",
                column: "OrderId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LoginHistories_AppUsers_UserId",
                table: "LoginHistories",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyPoints_AppUsers_UserId",
                table: "LoyaltyPoints",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LoyaltyTransactions_AppUsers_UserId",
                table: "LoyaltyTransactions",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NewsArticles_AppUsers_AuthorId",
                table: "NewsArticles",
                column: "AuthorId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_NotificationSettings_AppUsers_UserId",
                table: "NotificationSettings",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequests_Coupons_CouponId",
                table: "OrderRequests",
                column: "CouponId",
                principalTable: "Coupons",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_OrderRequests_OrderId",
                table: "Payments",
                column: "OrderId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanPrices_ServicePlans_ServicePlanId",
                table: "PlanPrices",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Promotions_ServicePlans_ServicePlanId",
                table: "Promotions",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ReferralCodes_AppUsers_UserId",
                table: "ReferralCodes",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_AppUsers_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_ServicePlans_ServicePlanId",
                table: "Reviews",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SavedPaymentMethods_AppUsers_UserId",
                table: "SavedPaymentMethods",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServicePlans_ServiceCategories_CategoryId",
                table: "ServicePlans",
                column: "CategoryId",
                principalTable: "ServiceCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceStatusLogs_OrderRequests_OrderRequestId",
                table: "ServiceStatusLogs",
                column: "OrderRequestId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceStatusLogs_ServicePlans_ServicePlanId",
                table: "ServiceStatusLogs",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_SslCertificates_DomainRecords_DomainId",
                table: "SslCertificates",
                column: "DomainId",
                principalTable: "DomainRecords",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTickets_AppUsers_AssignedStaffId",
                table: "SupportTickets",
                column: "AssignedStaffId",
                principalTable: "AppUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SupportTickets_AppUsers_UserId",
                table: "SupportTickets",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketMessages_AppUsers_SenderId",
                table: "TicketMessages",
                column: "SenderId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_TicketMessages_SupportTickets_TicketId",
                table: "TicketMessages",
                column: "TicketId",
                principalTable: "SupportTickets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserSessions_AppUsers_UserId",
                table: "UserSessions",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WishlistItems_AppUsers_UserId",
                table: "WishlistItems",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_WishlistItems_ServicePlans_ServicePlanId",
                table: "WishlistItems",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
