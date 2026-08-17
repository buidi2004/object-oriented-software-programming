using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImageUrlToServicePlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "ServicePlans",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPrivacyProtected",
                table: "DomainRecords",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "AppTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DockerImage = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsFree = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CdnDistributions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OriginUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Cname = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    HttpsEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CachePurged = table.Column<bool>(type: "bit", nullable: false),
                    TotalBandwidthBytes = table.Column<long>(type: "bigint", nullable: false),
                    CachedRequests = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CdnDistributions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DatabaseInstances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Engine = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Port = table.Column<int>(type: "int", nullable: false),
                    ConnectionString = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DatabaseInstances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DatabaseInstances_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DedicatedServers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServerName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CpuModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RamGb = table.Column<int>(type: "int", nullable: false),
                    DiskBytes = table.Column<long>(type: "bigint", nullable: false),
                    OsImage = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<long>(type: "bigint", nullable: false),
                    RemoteAccessEnabled = table.Column<bool>(type: "bit", nullable: false),
                    ProvisionedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DedicatedServers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "EmailHostingAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Domain = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    MaxMailboxes = table.Column<int>(type: "int", nullable: false),
                    MailboxSizeMb = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    HasCustomDomain = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailHostingAccounts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GameServerInstances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GameType = table.Column<int>(type: "int", nullable: false),
                    Port = table.Column<int>(type: "int", nullable: false),
                    ContainerId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ServerName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameServerInstances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameServerInstances_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HostingPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DiskGb = table.Column<int>(type: "int", nullable: false),
                    BandwidthGb = table.Column<int>(type: "int", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    IsFeatured = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HostingPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MarketplaceListings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SellerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PreviewImage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    Downloads = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplaceListings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MarketplacePurchases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ListingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BuyerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PaymentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<long>(type: "bigint", nullable: false),
                    DownloadUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    PurchasedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplacePurchases", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SecuritySubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetResourceId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    AddonType = table.Column<long>(type: "bigint", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SubscribedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecuritySubscriptions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StaticSites",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    BuildCommand = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    OutputDirectory = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CustomDomain = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DeployUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SourceSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    TotalDeploys = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaticSites", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StorageBucket",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Visibility = table.Column<int>(type: "int", nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StorageBucket", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StorageBucket_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WebsiteBuilderProjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    TemplateId = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    LiveUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebsiteBuilderProjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HostingAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContainerId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ControlPanelUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    DiskUsedGb = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HostingAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HostingAccounts_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HostingAccounts_HostingPlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "HostingPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StaticDeploys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StaticSiteId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GitCommitHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Status = table.Column<long>(type: "bigint", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinishedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaticDeploys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaticDeploys_StaticSites_StaticSiteId",
                        column: x => x.StaticSiteId,
                        principalTable: "StaticSites",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StorageObject",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BucketId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StorageObject", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StorageObject_StorageBucket_BucketId",
                        column: x => x.BucketId,
                        principalTable: "StorageBucket",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WebsitePages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentJson = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "{}"),
                    Order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebsitePages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WebsitePages_WebsiteBuilderProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "WebsiteBuilderProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AppInstallations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HostingAccountId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ContainerId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    InstallUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppInstallations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppInstallations_AppTemplates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "AppTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppInstallations_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppInstallations_HostingAccounts_HostingAccountId",
                        column: x => x.HostingAccountId,
                        principalTable: "HostingAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppInstallations_HostingAccountId",
                table: "AppInstallations",
                column: "HostingAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_AppInstallations_TemplateId",
                table: "AppInstallations",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_AppInstallations_UserId",
                table: "AppInstallations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DatabaseInstances_UserId",
                table: "DatabaseInstances",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_GameServerInstances_UserId",
                table: "GameServerInstances",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HostingAccounts_PlanId",
                table: "HostingAccounts",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_HostingAccounts_UserId",
                table: "HostingAccounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SecuritySubscriptions_UserId_TargetResourceId_AddonType",
                table: "SecuritySubscriptions",
                columns: new[] { "UserId", "TargetResourceId", "AddonType" });

            migrationBuilder.CreateIndex(
                name: "IX_StaticDeploys_StaticSiteId",
                table: "StaticDeploys",
                column: "StaticSiteId");

            migrationBuilder.CreateIndex(
                name: "IX_StorageBucket_UserId",
                table: "StorageBucket",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_StorageObject_BucketId",
                table: "StorageObject",
                column: "BucketId");

            migrationBuilder.CreateIndex(
                name: "IX_WebsitePages_ProjectId",
                table: "WebsitePages",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppInstallations");

            migrationBuilder.DropTable(
                name: "CdnDistributions");

            migrationBuilder.DropTable(
                name: "DatabaseInstances");

            migrationBuilder.DropTable(
                name: "DedicatedServers");

            migrationBuilder.DropTable(
                name: "EmailHostingAccounts");

            migrationBuilder.DropTable(
                name: "GameServerInstances");

            migrationBuilder.DropTable(
                name: "MarketplaceListings");

            migrationBuilder.DropTable(
                name: "MarketplacePurchases");

            migrationBuilder.DropTable(
                name: "SecuritySubscriptions");

            migrationBuilder.DropTable(
                name: "StaticDeploys");

            migrationBuilder.DropTable(
                name: "StorageObject");

            migrationBuilder.DropTable(
                name: "WebsitePages");

            migrationBuilder.DropTable(
                name: "AppTemplates");

            migrationBuilder.DropTable(
                name: "HostingAccounts");

            migrationBuilder.DropTable(
                name: "StaticSites");

            migrationBuilder.DropTable(
                name: "StorageBucket");

            migrationBuilder.DropTable(
                name: "WebsiteBuilderProjects");

            migrationBuilder.DropTable(
                name: "HostingPlans");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "ServicePlans");

            migrationBuilder.DropColumn(
                name: "IsPrivacyProtected",
                table: "DomainRecords");
        }
    }
}
