using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class DDDPhase3Refactoring : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_OrderRequests_OrderRequestId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_OrderRequests_OrderRequestId",
                table: "Payments");

            migrationBuilder.RenameColumn(
                name: "OrderRequestId",
                table: "Payments",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_OrderRequestId",
                table: "Payments",
                newName: "IX_Payments_OrderId");

            migrationBuilder.RenameColumn(
                name: "OrderRequestId",
                table: "Invoices",
                newName: "OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Invoices_OrderRequestId",
                table: "Invoices",
                newName: "IX_Invoices_OrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_OrderRequests_OrderId",
                table: "Invoices",
                column: "OrderId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_OrderRequests_OrderId",
                table: "Payments",
                column: "OrderId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_OrderRequests_OrderId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_Payments_OrderRequests_OrderId",
                table: "Payments");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Payments",
                newName: "OrderRequestId");

            migrationBuilder.RenameIndex(
                name: "IX_Payments_OrderId",
                table: "Payments",
                newName: "IX_Payments_OrderRequestId");

            migrationBuilder.RenameColumn(
                name: "OrderId",
                table: "Invoices",
                newName: "OrderRequestId");

            migrationBuilder.RenameIndex(
                name: "IX_Invoices_OrderId",
                table: "Invoices",
                newName: "IX_Invoices_OrderRequestId");

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_OrderRequests_OrderRequestId",
                table: "Invoices",
                column: "OrderRequestId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_OrderRequests_OrderRequestId",
                table: "Payments",
                column: "OrderRequestId",
                principalTable: "OrderRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
