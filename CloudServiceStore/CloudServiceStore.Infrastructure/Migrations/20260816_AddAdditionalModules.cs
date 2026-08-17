using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAdditionalModules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Module #13: Security Add-ons (WAF/Malware Scan)
            migrationBuilder.CreateTable(
                name: "SecuritySubscriptions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TargetResourceId = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    AddonType = table.Column<long>(type: "bigint", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    SubscribedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecuritySubscriptions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SecuritySubscriptions_UserId_TargetResourceId_AddonType",
                table: "SecuritySubscriptions",
                columns: new[] { "UserId", "TargetResourceId", "AddonType" });

            // Module #14: Static Site Hosting
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
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaticSites", x => x.Id);
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
                    FinishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaticDeploys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StaticDeploys_StaticSites_StaticSiteId",
                        column: x => x.StaticSiteId,
                        principalTable: "StaticSites",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StaticDeploys_StaticSiteId",
                table: "StaticDeploys",
                column: "StaticSiteId");

            // Module #4: CDN Distribution
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
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CdnDistributions", x => x.Id);
                });

            // Module #7: Dedicated Server
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
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DedicatedServers", x => x.Id);
                });

            // Module #2: Email Hosting
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
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmailHostingAccounts", x => x.Id);
                });

            // Module #8: Website Builder
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
                    PublishedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebsiteBuilderProjects", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WebsitePages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PageName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentJson = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "{}"),
                    Order = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebsitePages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WebsitePages_WebsiteBuilderProjects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "WebsiteBuilderProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WebsitePages_ProjectId",
                table: "WebsitePages",
                column: "ProjectId");

            // Module #16: Marketplace
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
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                    PurchasedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketplacePurchases", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarketplacePurchases_MarketplaceListings_ListingId",
                        column: x => x.ListingId,
                        principalTable: "MarketplaceListings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarketplacePurchases_ListingId",
                table: "MarketplacePurchases",
                column: "ListingId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "MarketplacePurchases");
            migrationBuilder.DropTable(name: "MarketplaceListings");
            migrationBuilder.DropTable(name: "WebsitePages");
            migrationBuilder.DropTable(name: "WebsiteBuilderProjects");
            migrationBuilder.DropTable(name: "EmailHostingAccounts");
            migrationBuilder.DropTable(name: "DedicatedServers");
            migrationBuilder.DropTable(name: "CdnDistributions");
            migrationBuilder.DropTable(name: "StaticDeploys");
            migrationBuilder.DropTable(name: "StaticSites");
            migrationBuilder.DropTable(name: "SecuritySubscriptions");
        }
    }
}
