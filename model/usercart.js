module.exports = (sequelize, DataTypes) => {
  const userCart = sequelize.define('userCart', {
    UserId: {
      type: DataTypes.INTEGER,
    },
    ProductId: {
      type: DataTypes.INTEGER
    },
    quantity: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'shopping_carts'
  });
  return userCart;
}
