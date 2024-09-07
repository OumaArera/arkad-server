module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Newsletters', 'title', {
      type: Sequelize.STRING(500), // Change title to allow 500 characters
      allowNull: false
    });

    await queryInterface.changeColumn('Newsletters', 'content', {
      type: Sequelize.TEXT, // Ensure content is of TEXT type
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Newsletters', 'title', {
      type: Sequelize.STRING(255), // Revert title back to 255 characters
      allowNull: false
    });

    await queryInterface.changeColumn('Newsletters', 'content', {
      type: Sequelize.STRING(255), // Revert content back to STRING
      allowNull: false
    });
  }
};
