using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Salgadin.Migrations
{
    /// <inheritdoc />
    public partial class AddWhatsAppIntegrationFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserWhatsAppAccounts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    WhatsAppId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWhatsAppAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserWhatsAppAccounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppLinkCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UsedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppLinkCodes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppLinkCodes_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WhatsAppProcessedMessages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProviderMessageId = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    PhoneNumber = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WhatsAppProcessedMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WhatsAppProcessedMessages_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserWhatsAppAccounts_PhoneNumber",
                table: "UserWhatsAppAccounts",
                column: "PhoneNumber");

            migrationBuilder.CreateIndex(
                name: "IX_UserWhatsAppAccounts_UserId",
                table: "UserWhatsAppAccounts",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppLinkCodes_Code",
                table: "WhatsAppLinkCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppLinkCodes_UserId",
                table: "WhatsAppLinkCodes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppProcessedMessages_PhoneNumber",
                table: "WhatsAppProcessedMessages",
                column: "PhoneNumber");

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppProcessedMessages_ProviderMessageId",
                table: "WhatsAppProcessedMessages",
                column: "ProviderMessageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WhatsAppProcessedMessages_UserId",
                table: "WhatsAppProcessedMessages",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserWhatsAppAccounts");

            migrationBuilder.DropTable(
                name: "WhatsAppLinkCodes");

            migrationBuilder.DropTable(
                name: "WhatsAppProcessedMessages");
        }
    }
}
