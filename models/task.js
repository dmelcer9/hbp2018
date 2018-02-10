'use strict'

module.exports = (sequelize, DataTypes) => {
  var Task = sequelize.define('Task', {
    name: {type: DataTypes.STRING, allowNull:false},
    description: {type: DataTypes.STRING},
    completed: {type: DataTypes.BOOLEAN, allowNull:false}
  });

  return Task;
}
