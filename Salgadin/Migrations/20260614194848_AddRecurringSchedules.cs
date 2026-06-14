using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Salgadin.Migrations
{
    /// <inheritdoc />
    public partial class AddRecurringSchedules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RecurringPeriodMonth",
                table: "Incomes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurringPeriodYear",
                table: "Incomes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurringScheduleId",
                table: "Incomes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurringPeriodMonth",
                table: "Expenses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurringPeriodYear",
                table: "Expenses",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecurringScheduleId",
                table: "Expenses",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RecurringSchedules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CategoryId = table.Column<int>(type: "integer", nullable: true),
                    SubcategoryId = table.Column<int>(type: "integer", nullable: true),
                    Frequency = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DayOfMonth = table.Column<int>(type: "integer", nullable: false),
                    NextOccurrenceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastGeneratedOccurrenceDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Source = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecurringSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RecurringSchedules_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecurringSchedules_Subcategories_SubcategoryId",
                        column: x => x.SubcategoryId,
                        principalTable: "Subcategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_RecurringSchedules_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_RecurringScheduleId",
                table: "Incomes",
                column: "RecurringScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_Incomes_UserId_RecurringScheduleId_RecurringPeriodYear_Recu~",
                table: "Incomes",
                columns: new[] { "UserId", "RecurringScheduleId", "RecurringPeriodYear", "RecurringPeriodMonth" },
                unique: true,
                filter: "\"RecurringScheduleId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_RecurringScheduleId",
                table: "Expenses",
                column: "RecurringScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_Expenses_UserId_RecurringScheduleId_RecurringPeriodYear_Rec~",
                table: "Expenses",
                columns: new[] { "UserId", "RecurringScheduleId", "RecurringPeriodYear", "RecurringPeriodMonth" },
                unique: true,
                filter: "\"RecurringScheduleId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSchedules_CategoryId",
                table: "RecurringSchedules",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSchedules_SubcategoryId",
                table: "RecurringSchedules",
                column: "SubcategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSchedules_UserId_NextOccurrenceDate",
                table: "RecurringSchedules",
                columns: new[] { "UserId", "NextOccurrenceDate" });

            migrationBuilder.CreateIndex(
                name: "IX_RecurringSchedules_UserId_Status",
                table: "RecurringSchedules",
                columns: new[] { "UserId", "Status" });

            migrationBuilder.AddForeignKey(
                name: "FK_Expenses_RecurringSchedules_RecurringScheduleId",
                table: "Expenses",
                column: "RecurringScheduleId",
                principalTable: "RecurringSchedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Incomes_RecurringSchedules_RecurringScheduleId",
                table: "Incomes",
                column: "RecurringScheduleId",
                principalTable: "RecurringSchedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Expenses_RecurringSchedules_RecurringScheduleId",
                table: "Expenses");

            migrationBuilder.DropForeignKey(
                name: "FK_Incomes_RecurringSchedules_RecurringScheduleId",
                table: "Incomes");

            migrationBuilder.DropTable(
                name: "RecurringSchedules");

            migrationBuilder.DropIndex(
                name: "IX_Incomes_RecurringScheduleId",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Incomes_UserId_RecurringScheduleId_RecurringPeriodYear_Recu~",
                table: "Incomes");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_RecurringScheduleId",
                table: "Expenses");

            migrationBuilder.DropIndex(
                name: "IX_Expenses_UserId_RecurringScheduleId_RecurringPeriodYear_Rec~",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "RecurringPeriodMonth",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "RecurringPeriodYear",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "RecurringScheduleId",
                table: "Incomes");

            migrationBuilder.DropColumn(
                name: "RecurringPeriodMonth",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "RecurringPeriodYear",
                table: "Expenses");

            migrationBuilder.DropColumn(
                name: "RecurringScheduleId",
                table: "Expenses");
        }
    }
}
