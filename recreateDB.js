//This deletes everything in the database and recreates tables

const db =  require("./models/index.js");
require('./relations.js');

var f = async function(){
  console.log("Recreating db")

  await db.sequelize.sync({force:true});

  console.log("Done!");

  process.exit();

};

f();
