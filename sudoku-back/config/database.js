const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  "sudoku_db", 
  "root", 
  "ParanoidAndroid", //senha
  {
    host: 'localhost',
    dialect: 'mysql'
  }
);

module.exports = sequelize;
