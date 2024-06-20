const sequelize = require('../config/database');
const User = require('./User');

const syncDatabase = async () => {
  await sequelize.sync({ force: true }); // Sincroniza o banco de dados
};

//syncDatabase();

module.exports = {
  User,
  syncDatabase,
};
