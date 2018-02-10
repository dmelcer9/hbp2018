const Sequelize = require('sequelize');
const params = require('./config-private.js');

const sequelize = new Sequelize("hbpbackend",params.dbuser, params.dbpass,{
  host:'localhost',
  dialect:'postgres'
})

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
