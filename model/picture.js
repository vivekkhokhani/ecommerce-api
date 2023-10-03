module.exports = (sequelize, DataTypes) => {
  const productImage = sequelize.define('productImages', {

    productImages: {
      type: DataTypes.STRING,
    },
    ProductId: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'product_images'
  });
  return productImage;
}
