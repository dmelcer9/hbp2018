var bcrypt = require('bcrypt');

var express = require('express');
var router = express.Router();
const db =  require("../models/index.js");
var exporters = require("../createJSON.js");


router.post('/current', async function(req, res){

  res.json(exporters.user(req.user));

})

router.post('', async function(req, res){
  var body = req.body;

  if(!body.firstName || !body.lastName || !body.uname || !body.password){
    res.status(400).send("Invalid params");
    return;
  }

  //Make sure user doesn't exist
  var userExists = await db.User.findOne({where:{uname:body.uname}});
  if(userExists){
    res.status(400).send("User already exists");
    return;
  }

  var hashed = await bcrypt.hash(body.password, 10);
  console.log(hashed);
  await db.User.create({
    firstName:body.firstName,
    lastName:body.lastName,
    uname:body.uname,
    passwordHashed: hashed
  });

  res.status(200).send("Created User");
})

module.exports = router;
