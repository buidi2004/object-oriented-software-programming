using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStaticSiteState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "StaticSites",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "StaticSites",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "StaticSites",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_StaticSites_IdempotencyKey",
                table: "StaticSites",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StaticSites_UserId",
                table: "StaticSites",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_StaticSites_AppUsers_UserId",
                table: "StaticSites",
                column: "UserId",
                principalTable: "AppUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StaticSites_AppUsers_UserId",
                table: "StaticSites");

            migrationBuilder.DropIndex(
                name: "IX_StaticSites_IdempotencyKey",
                table: "StaticSites");

            migrationBuilder.DropIndex(
                name: "IX_StaticSites_UserId",
                table: "StaticSites");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "StaticSites");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "StaticSites");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "StaticSites");
        }
    }
}
