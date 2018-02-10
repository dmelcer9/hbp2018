'use strict';

const Sequelize = require('sequelize');
const params = require('../config-private.js');
const fs = require('fs');
const path = require('path');
var basename  = path.basename(__filename);
var db = {};

const sequelize = new Sequelize("hbpbackend",params.dbuser, params.dbpass,{
  host:'localhost',
  dialect:'postgres'
})

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
