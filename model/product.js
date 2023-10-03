module.exports = (sequelize, DataTypes) => {
  const PRODUCT = sequelize.define('Product', {

    productName: {
      type: DataTypes.STRING,
    },
    productPrice: {
      type: DataTypes.DECIMAL(10, 2)
    },
    manufacturer: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.STRING
    },
    UserId: {
      type: DataTypes.INTEGER
    },
  }, {
    tableName: 'Products'
  });
  return PRODUCT;
}


