module.exports = (sequelize, DataTypes) => {
    const orders = sequelize.define('orders', {
        UserId: {
            type: DataTypes.INTEGER
        },
        totalPrice:{
            type: DataTypes.DECIMAL(10, 2)
        },
        status:{
            type: DataTypes.ENUM('pending', 'success'),
            defaultValue:'pending'
        },  
    }, {
        tableName: 'users_orders'
    });
    return orders;
}
