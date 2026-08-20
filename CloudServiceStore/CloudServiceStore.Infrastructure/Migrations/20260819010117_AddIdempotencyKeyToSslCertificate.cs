using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CloudServiceStore.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIdempotencyKeyToSslCertificate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FailureReason",
                table: "SslCertificates",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IdempotencyKey",
                table: "SslCertificates",
                type: "nvarchar(450)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "Status",
                table: "SslCertificates",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_SslCertificates_IdempotencyKey",
                table: "SslCertificates",
                column: "IdempotencyKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SslCertificates_IdempotencyKey",
                table: "SslCertificates");

            migrationBuilder.DropColumn(
                name: "FailureReason",
                table: "SslCertificates");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "SslCertificates");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "SslCertificates");
        }
    }
}
