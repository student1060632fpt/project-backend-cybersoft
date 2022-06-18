"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Roles",
      [
        {
          type: "user",
          description: "customer",
          createdAt: "2022-06-12 16:22:22",
          updatedAt: "2022-06-12 16:22:22",
        },
        {
          type: "admin",
          description: "administrator",
          createdAt: "2022-06-12 16:22:22",
          updatedAt: "2022-06-12 16:22:22",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
