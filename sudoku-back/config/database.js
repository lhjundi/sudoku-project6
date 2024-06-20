const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  "sudoku_db", 
  "root", //usuario
  "senhaMysql", //senha
  {
    host: 'localhost',
    dialect: 'mysql'
  }
);

module.exports = sequelize;
