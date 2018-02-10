'use strict'


module.exports = (sequelize, DataTypes) => {
  var Event = sequelize.define('Event', {
    eventCode: {type:DataTypes.STRING, allowNull:false},
    title: {type:DataTypes.STRING, allowNull:false},
    description: DataTypes.STRING,
    date: {type:DataTypes.DATE, allowNull:false},
    location: {type:DataTypes.STRING}
  });

  return Event;
}
