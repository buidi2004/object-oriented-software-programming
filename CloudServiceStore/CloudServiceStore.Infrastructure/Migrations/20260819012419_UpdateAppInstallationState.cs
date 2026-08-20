using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAppInstallationState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "AppInstallations",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "AppInstallations",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "AppInstallations",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AppInstallations_IdempotencyKey",
                table: "AppInstallations",
                column: "IdempotencyKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppInstallations_IdempotencyKey",
                table: "AppInstallations");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "AppInstallations");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "AppInstallations");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "AppInstallations");
        }
    }
}
