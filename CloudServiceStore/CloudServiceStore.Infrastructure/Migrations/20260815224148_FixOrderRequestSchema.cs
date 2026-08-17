using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixOrderRequestSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ArticleComments_NewsArticles_ArticleId",
                table: "ArticleComments");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions");

            migrationBuilder.RenameColumn(
                name: "ArticleId",
                table: "ArticleComments",
                newName: "NewsArticleId");

            migrationBuilder.RenameIndex(
                name: "IX_ArticleComments_ArticleId",
                table: "ArticleComments",
                newName: "IX_ArticleComments_NewsArticleId");

            migrationBuilder.AlterColumn<string>(
                name: "Key",
                table: "SystemSettings",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "NewsArticles",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishedAt",
                table: "NewsArticles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "NewsArticles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailUrl",
                table: "NewsArticles",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "NewsArticles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Message",
                table: "ChatMessages",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "ArticleComments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_Key",
                table: "SystemSettings",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId_PermissionId",
                table: "RolePermissions",
                columns: new[] { "RoleId", "PermissionId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ArticleComments_NewsArticles_NewsArticleId",
                table: "ArticleComments",
                column: "NewsArticleId",
                principalTable: "NewsArticles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ArticleComments_NewsArticles_NewsArticleId",
                table: "ArticleComments");

            migrationBuilder.DropIndex(
                name: "IX_SystemSettings_Key",
                table: "SystemSettings");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_RoleId_PermissionId",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "PublishedAt",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "Tags",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "ThumbnailUrl",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "NewsArticles");

            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "ArticleComments");

            migrationBuilder.RenameColumn(
                name: "NewsArticleId",
                table: "ArticleComments",
                newName: "ArticleId");

            migrationBuilder.RenameIndex(
                name: "IX_ArticleComments_NewsArticleId",
                table: "ArticleComments",
                newName: "IX_ArticleComments_ArticleId");

            migrationBuilder.AlterColumn<string>(
                name: "Key",
                table: "SystemSettings",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "NewsArticles",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(256)",
                oldMaxLength: 256);

            migrationBuilder.AlterColumn<string>(
                name: "Message",
                table: "ChatMessages",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId",
                table: "RolePermissions",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_ArticleComments_NewsArticles_ArticleId",
                table: "ArticleComments",
                column: "ArticleId",
                principalTable: "NewsArticles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
