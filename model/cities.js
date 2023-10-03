module.exports = (sequelize, DataTypes) => {
  const cities = sequelize.define('cities', {
    cities: {
      type: DataTypes.STRING
    },
    StateId: {
      type: DataTypes.INTEGER
    },
  }, {
    freezeTableName: true
  });
  return cities;
}
