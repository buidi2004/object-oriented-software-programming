using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DDDPhase2Refactoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PlanPrices_ServicePlanId",
                table: "PlanPrices");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Reviews",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsFeatured",
                table: "Reviews",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "PlanPrices",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "VND");

            migrationBuilder.AddColumn<bool>(
                name: "AutoRenew",
                table: "OrderRequests",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Carts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "ApiKeys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    KeyHash = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Scopes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiKeys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BackupJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ScheduledAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SizeMb = table.Column<int>(type: "int", nullable: true),
                    BackupUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BackupJobs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BackupJobs_OrderRequests_OrderRequestId",
                        column: x => x.OrderRequestId,
                        principalTable: "OrderRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Banners",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    LinkUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Banners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DomainRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    OrderRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AutoRenew = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DomainRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DomainRecords_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DomainRecords_OrderRequests_OrderRequestId",
                        column: x => x.OrderRequestId,
                        principalTable: "OrderRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromCurrency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ToCurrency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(18,6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeRates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GiftCards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RemainingAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GiftCards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Invoices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PdfUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Invoices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Invoices_OrderRequests_OrderRequestId",
                        column: x => x.OrderRequestId,
                        principalTable: "OrderRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyPoints",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyPoints", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoyaltyPoints_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LoyaltyTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Points = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    RefOrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoyaltyTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoyaltyTransactions_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MigrationRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FromProvider = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MigrationRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NewsletterSubscribers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    SubscribedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NewsletterSubscribers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReferralCodes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReferralCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReferralCodes_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReferralRewards",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReferrerUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReferredUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RewardAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReferralRewards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReferralRewards_AppUsers_ReferredUserId",
                        column: x => x.ReferredUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReferralRewards_AppUsers_ReferrerUserId",
                        column: x => x.ReferrerUserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RefundRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefundRequests", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RenewalJobs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NextRunAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RenewalJobs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SavedPaymentMethods",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Gateway = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MaskedInfo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedPaymentMethods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedPaymentMethods_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceStatusLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServicePlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    OrderRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CheckedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUp = table.Column<bool>(type: "bit", nullable: false),
                    ResponseTimeMs = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceStatusLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceStatusLogs_OrderRequests_OrderRequestId",
                        column: x => x.OrderRequestId,
                        principalTable: "OrderRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ServiceStatusLogs_ServicePlans_ServicePlanId",
                        column: x => x.ServicePlanId,
                        principalTable: "ServicePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Wallets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Balance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wallets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WalletTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WalletId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    RefOrderId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WalletTransactions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WishlistItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServicePlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AddedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WishlistItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WishlistItems_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WishlistItems_ServicePlans_ServicePlanId",
                        column: x => x.ServicePlanId,
                        principalTable: "ServicePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DnsRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DomainId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    TTL = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DnsRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DnsRecords_DomainRecords_DomainId",
                        column: x => x.DomainId,
                        principalTable: "DomainRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SslCertificates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DomainId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Csr = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Certificate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PrivateKey = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExpiryDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SslCertificates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SslCertificates_DomainRecords_DomainId",
                        column: x => x.DomainId,
                        principalTable: "DomainRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlanPrices_ServicePlanId_BillingCycle_Currency",
                table: "PlanPrices",
                columns: new[] { "ServicePlanId", "BillingCycle", "Currency" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BackupJobs_OrderRequestId",
                table: "BackupJobs",
                column: "OrderRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_DnsRecords_DomainId",
                table: "DnsRecords",
                column: "DomainId");

            migrationBuilder.CreateIndex(
                name: "IX_DomainRecords_OrderRequestId",
                table: "DomainRecords",
                column: "OrderRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_DomainRecords_UserId",
                table: "DomainRecords",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_FromCurrency_ToCurrency",
                table: "ExchangeRates",
                columns: new[] { "FromCurrency", "ToCurrency" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GiftCards_Code",
                table: "GiftCards",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_InvoiceNumber",
                table: "Invoices",
                column: "InvoiceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_OrderRequestId",
                table: "Invoices",
                column: "OrderRequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyPoints_UserId",
                table: "LoyaltyPoints",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoyaltyTransactions_UserId",
                table: "LoyaltyTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_NewsletterSubscribers_Email",
                table: "NewsletterSubscribers",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReferralCodes_Code",
                table: "ReferralCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReferralCodes_UserId",
                table: "ReferralCodes",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReferralRewards_ReferredUserId",
                table: "ReferralRewards",
                column: "ReferredUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReferralRewards_ReferrerUserId_ReferredUserId",
                table: "ReferralRewards",
                columns: new[] { "ReferrerUserId", "ReferredUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SavedPaymentMethods_UserId",
                table: "SavedPaymentMethods",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceStatusLogs_OrderRequestId",
                table: "ServiceStatusLogs",
                column: "OrderRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceStatusLogs_ServicePlanId",
                table: "ServiceStatusLogs",
                column: "ServicePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SslCertificates_DomainId",
                table: "SslCertificates",
                column: "DomainId");

            migrationBuilder.CreateIndex(
                name: "IX_WishlistItems_ServicePlanId",
                table: "WishlistItems",
                column: "ServicePlanId");

            migrationBuilder.CreateIndex(
                name: "IX_WishlistItems_UserId_ServicePlanId",
                table: "WishlistItems",
                columns: new[] { "UserId", "ServicePlanId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApiKeys");

            migrationBuilder.DropTable(
                name: "BackupJobs");

            migrationBuilder.DropTable(
                name: "Banners");

            migrationBuilder.DropTable(
                name: "DnsRecords");

            migrationBuilder.DropTable(
                name: "ExchangeRates");

            migrationBuilder.DropTable(
                name: "GiftCards");

            migrationBuilder.DropTable(
                name: "Invoices");

            migrationBuilder.DropTable(
                name: "LoyaltyPoints");

            migrationBuilder.DropTable(
                name: "LoyaltyTransactions");

            migrationBuilder.DropTable(
                name: "MigrationRequests");

            migrationBuilder.DropTable(
                name: "NewsletterSubscribers");

            migrationBuilder.DropTable(
                name: "ReferralCodes");

            migrationBuilder.DropTable(
                name: "ReferralRewards");

            migrationBuilder.DropTable(
                name: "RefundRequests");

            migrationBuilder.DropTable(
                name: "RenewalJobs");

            migrationBuilder.DropTable(
                name: "SavedPaymentMethods");

            migrationBuilder.DropTable(
                name: "ServiceStatusLogs");

            migrationBuilder.DropTable(
                name: "SslCertificates");

            migrationBuilder.DropTable(
                name: "Wallets");

            migrationBuilder.DropTable(
                name: "WalletTransactions");

            migrationBuilder.DropTable(
                name: "WishlistItems");

            migrationBuilder.DropTable(
                name: "DomainRecords");

            migrationBuilder.DropIndex(
                name: "IX_PlanPrices_ServicePlanId_BillingCycle_Currency",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "IsFeatured",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "Currency",
                table: "PlanPrices");

            migrationBuilder.DropColumn(
                name: "AutoRenew",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Carts");

            migrationBuilder.CreateIndex(
                name: "IX_PlanPrices_ServicePlanId",
                table: "PlanPrices",
                column: "ServicePlanId");
        }
    }
}
