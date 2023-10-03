module.exports = (sequelize, DataTypes) => {
    const product = sequelize.define('products', {

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
        freezeTableName: true

    });
    return product;
}


