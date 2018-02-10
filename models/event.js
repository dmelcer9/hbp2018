'use strict'


module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('Event', {
    eventCode: {type:DataTypes.STRING, allowNull:false},
    description: DataTypes.STRING,
    date: DataTypes.DATE,
  });

  return Event;
}
