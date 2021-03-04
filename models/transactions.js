'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transactions.belongsTo(models.Categories, { as: 'category', foreignKey: 'categoryId', targetKey: 'id'});
      Transactions.belongsTo(models.Wallets, { as: 'wallet', foreignKey: 'walletId', targetKey: 'id'});
    }
  };
  Transactions.init({
    userUuid: DataTypes.STRING,
    walletId: DataTypes.STRING,
    categoryId: DataTypes.STRING,
    balance: DataTypes.FLOAT,
    date: DataTypes.DATE,
    note: DataTypes.STRING,
    type: DataTypes.ENUM('income', 'expense')
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transactions;
};
