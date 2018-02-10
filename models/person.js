'use strict';

module.exports = (sequelize, DataTypes) => {
  var Person = sequelize.define('User', {
    firstName: {type: DataTypes.STRING,allowNull: false},
    lastName: {type: DataTypes.STRING,allowNull: false},
    uname: {type: DataTypes.STRING,allowNull: false},
    passwordHashed: {type: DataTypes.STRING,allowNull: false}
  }
  })

  return Person;
}
