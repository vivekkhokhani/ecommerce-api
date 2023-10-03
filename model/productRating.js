module.exports = (sequelize, DataTypes) => {
    const rating = sequelize.define('rating', {
        UserId: {
            type: DataTypes.INTEGER
        },
        ProductId: {
            type: DataTypes.INTEGER
        },
        rating: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        review: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'product_ratings'
    });
    return rating;
}
