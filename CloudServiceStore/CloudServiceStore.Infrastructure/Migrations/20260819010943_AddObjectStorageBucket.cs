using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddObjectStorageBucket : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ObjectStorageBuckets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BucketName = table.Column<string>(type: "nvarchar(63)", maxLength: 63, nullable: false),
                    Region = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CapacityGB = table.Column<int>(type: "int", nullable: false),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Status = table.Column<long>(type: "bigint", nullable: false),
                    FailureReason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ObjectStorageBuckets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ObjectStorageBuckets_AppUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AppUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ObjectStorageBuckets_BucketName",
                table: "ObjectStorageBuckets",
                column: "BucketName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ObjectStorageBuckets_IdempotencyKey",
                table: "ObjectStorageBuckets",
                column: "IdempotencyKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ObjectStorageBuckets_UserId",
                table: "ObjectStorageBuckets",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ObjectStorageBuckets");
        }
    }
}
