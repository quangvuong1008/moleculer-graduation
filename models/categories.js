'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Categories.hasMany(models.Categories, {as: 'children', foreignKey: 'parentId'});
      Categories.belongsTo(models.Categories, {as: 'parent', foreignKey: 'parentId'});
    }
  };
  Categories.init({
    parentId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    icon: DataTypes.STRING,
    type: DataTypes.ENUM('income', 'expense'),
  }, {
    sequelize,
    modelName: 'Categories',
  });
  return Categories;
};
