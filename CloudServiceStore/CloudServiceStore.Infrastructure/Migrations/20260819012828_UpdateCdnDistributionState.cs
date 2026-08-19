using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCdnDistributionState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "CdnDistributions",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "CdnDistributions",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "CdnDistributions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_CdnDistributions_IdempotencyKey",
                table: "CdnDistributions",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CdnDistributions_UserId",
                table: "CdnDistributions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_CdnDistributions_AppUsers_UserId",
                table: "CdnDistributions",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CdnDistributions_AppUsers_UserId",
                table: "CdnDistributions");

            migrationBuilder.DropIndex(
                name: "IX_CdnDistributions_IdempotencyKey",
                table: "CdnDistributions");

            migrationBuilder.DropIndex(
                name: "IX_CdnDistributions_UserId",
                table: "CdnDistributions");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "CdnDistributions");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "CdnDistributions");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "CdnDistributions");
        }
    }
}
