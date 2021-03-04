'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallets extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Wallets.belongsTo(models.TypeWallets, { as: 'typeWallet', foreignKey: 'typeWalletId', targetKey: 'id'});
    }
  };
  Wallets.init({
    userUuid: DataTypes.STRING,
    typeWalletId: DataTypes.STRING,
    name: DataTypes.STRING,
    balance: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Wallets',
  });
  return Wallets;
};
