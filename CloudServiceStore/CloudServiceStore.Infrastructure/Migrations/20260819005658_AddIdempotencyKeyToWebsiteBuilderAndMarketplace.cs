using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIdempotencyKeyToWebsiteBuilderAndMarketplace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "WebsiteBuilderProjects");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "MarketplaceListings");

            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "WebsiteBuilderProjects",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "WebsiteBuilderProjects",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "Status",
                table: "WebsiteBuilderProjects",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "MarketplaceListings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "MarketplaceListings",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "Status",
                table: "MarketplaceListings",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_WebsiteBuilderProjects_IdempotencyKey",
                table: "WebsiteBuilderProjects",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MarketplaceListings_IdempotencyKey",
                table: "MarketplaceListings",
                column: "IdempotencyKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_WebsiteBuilderProjects_IdempotencyKey",
                table: "WebsiteBuilderProjects");

            migrationBuilder.DropIndex(
                name: "IX_MarketplaceListings_IdempotencyKey",
                table: "MarketplaceListings");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "WebsiteBuilderProjects");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "WebsiteBuilderProjects");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "WebsiteBuilderProjects");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "MarketplaceListings");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "MarketplaceListings");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "MarketplaceListings");

            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "WebsiteBuilderProjects",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "MarketplaceListings",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
