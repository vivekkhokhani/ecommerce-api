module.exports = (sequelize, DataTypes) => {
  const states = sequelize.define('states', {
    state: {
      type: DataTypes.STRING
    }
  }, {
    freezeTableName: true
  });
  return states;
}
