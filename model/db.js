const { Sequelize, DataTypes } = require('sequelize');


const sequelize = new Sequelize(process.env.DbName, process.env.DBUser, process.env.DbPassword, {
    host: process.env.Host,
    dialect: process.env.Dbdialect,
    logging: false
});

try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('./user')(sequelize, DataTypes);
db.product = require('./products')(sequelize, DataTypes)
db.productImage = require('./picture')(sequelize, DataTypes)
db.userCart = require('./usercart')(sequelize, DataTypes)
db.states = require('./state')(sequelize, DataTypes)
db.cities = require('./cities')(sequelize, DataTypes)
db.order = require('../model/order')(sequelize, DataTypes)
db.productRating = require('./productRating')(sequelize, DataTypes)

// product and productimage
db.product.hasMany(db.productImage, { foreignKey: 'ProductId', onDelete: 'CASCADE' })
db.productImage.belongsTo(db.product, { foreignKey: 'ProductId' })


//join to cart
db.userCart.belongsTo(db.user, { foreignKey: 'UserId' })
db.user.hasMany(db.userCart, { foreignKey: 'UserId', onDelete: 'CASCADE' })

db.userCart.belongsTo(db.product, { foreignKey: 'ProductId' })
db.product.hasMany(db.userCart, { foreignKey: 'ProductId', onDelete: 'CASCADE' })

// join city and state table
db.cities.belongsTo(db.states, { foreignKey: 'StateId' })
db.states.hasMany(db.cities, { foreignKey: 'StateId', onDelete: 'CASCADE' })

//join user , city and state table

db.user.belongsTo(db.cities, { foreignKey: 'CityId', as: 'city' });
db.user.belongsTo(db.states, { foreignKey: 'StateId', as: 'userState' });

db.order.belongsTo(db.user, { foreignKey: 'UserId', onDelete: 'CASCADE' })
// db.order.belongsTo(db.userCart, { foreignKey: 'CartId' })
db.order.belongsTo(db.product, { foreignKey: 'ProductId', onDelete: 'CASCADE' })

// //user to product

db.product.belongsTo(db.user, { foreignKey: 'UserId', as: 'userdata', onDelete: 'CASCADE' })
db.user.hasMany(db.product, { foreignKey: 'UserId', as: 'products', onDelete: 'CASCADE' })

db.productRating.belongsTo(db.product, { foreignKey: 'ProductId', onDelete: 'CASCADE' })
db.product.hasMany(db.productRating, { foreignKey: 'ProductId', onDelete: 'CASCADE' })

db.sequelize.sync({ force: false });
module.exports = db;

