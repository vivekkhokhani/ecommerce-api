module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {

    firstName: {
      type: DataTypes.STRING,

    },
    lastName: {
      type: DataTypes.STRING,

    },
    password: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    faceBookId: {
      type: DataTypes.STRING
    },
    image: {
      type: DataTypes.STRING
    },
    CityId: {
      type: DataTypes.INTEGER,
    },
    StateId:{
      type:DataTypes.INTEGER
    },
    role: {
      type: DataTypes.ENUM('buyer', 'seller')
    },
    shopAddress: {
      type: DataTypes.STRING
    },
    shopContectNumber: {
      type: DataTypes.BIGINT
    },
    mobileNumber: {
      type: DataTypes.BIGINT
    },
    hello:{
      type: DataTypes.BIGINT
    }
  }, {
    tableName: 'users'
  });
  return User;
}


