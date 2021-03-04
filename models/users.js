'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Users.belongsTo(models.Currencies, { as: 'currency', foreignKey: 'currencyId' });
      Users.hasMany(models.Wallets, { as: 'wallets', sourceKey: 'uuid', foreignKey: 'userUuid' });
    }
  };
  Users.init({
    uid: DataTypes.STRING,
    uuid: DataTypes.STRING,
    currencyId: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    avatar: DataTypes.STRING,
    pin: DataTypes.STRING,
    isDarkMode: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};
