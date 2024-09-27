module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Members', 'middleName');
    await queryInterface.removeColumn('Members', 'lastName');
    await queryInterface.removeColumn('Members', 'gender');
    await queryInterface.removeColumn('Members', 'location');
    await queryInterface.removeColumn('Members', 'age');
    await queryInterface.removeColumn('Members', 'nationality');
    await queryInterface.removeColumn('Members', 'reasonForJoining');
    await queryInterface.renameColumn('Members', 'firstName', 'fullName');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Members', 'middleName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Members', 'lastName', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Members', 'gender', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Members', 'location', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Members', 'age', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('Members', 'nationality', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('Members', 'reasonForJoining', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.renameColumn('Members', 'fullName', 'firstName');
  }
};
