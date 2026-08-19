using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGameServerState : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "GameServerInstances",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "GameServerInstances",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_GameServerInstances_IdempotencyKey",
                table: "GameServerInstances",
                column: "IdempotencyKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GameServerInstances_IdempotencyKey",
                table: "GameServerInstances");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "GameServerInstances");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "GameServerInstances");
        }
    }
}
