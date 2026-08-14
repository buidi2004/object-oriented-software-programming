using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OrderRequests_ServicePlans_ServicePlanId",
                table: "OrderRequests");

            migrationBuilder.DropIndex(
                name: "IX_OrderRequests_ServicePlanId",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "BillingCycle",
                table: "OrderRequests");

            migrationBuilder.DropColumn(
                name: "ServicePlanId",
                table: "OrderRequests");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Wallets",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.CreateTable(
                name: "OrderItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OrderRequestId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServicePlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BillingCycle = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderItems_OrderRequests_OrderRequestId",
                        column: x => x.OrderRequestId,
                        principalTable: "OrderRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OrderItems_ServicePlans_ServicePlanId",
                        column: x => x.ServicePlanId,
                        principalTable: "ServicePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_OrderRequestId",
                table: "OrderItems",
                column: "OrderRequestId");

            migrationBuilder.CreateIndex(
                name: "IX_OrderItems_ServicePlanId",
                table: "OrderItems",
                column: "ServicePlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OrderItems");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Wallets");

            migrationBuilder.AddColumn<int>(
                name: "BillingCycle",
                table: "OrderRequests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "ServicePlanId",
                table: "OrderRequests",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_OrderRequests_ServicePlanId",
                table: "OrderRequests",
                column: "ServicePlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_OrderRequests_ServicePlans_ServicePlanId",
                table: "OrderRequests",
                column: "ServicePlanId",
                principalTable: "ServicePlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
