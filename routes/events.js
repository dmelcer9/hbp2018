var express = require('express');
var router = express.Router();
const db =  require("../models/index.js");
var exporters = require("../createJSON.js");

function makeid(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

async function getEventByID(id){
  var event = await db.Event.findOne({
    where:{
      eventCode: id
    },
    include:[{
      model: db.User,
      as:'users'
    },{
      model: db.User,
      as:'owner'
    },{
      model:db.Task,
      as:'Tasks'
  }]});

  return event;
}

function userIsInEvent(user, event){
  var myId = user.id;
  return event.users.some(userInEvent=>{
    return myId === userInEvent.id;
  })
}



router.post('/all', async function(req, res){
  var allEvents = await db.Event.findAll({include:[{
    model: db.User,
    as:'users'
  },{
    model: db.User,
    as:'owner'
  },{
    model:db.Task,
    as:'Tasks'
  }]});

  var myEvents = allEvents.filter(event=>userIsInEvent(req.user,event));
  res.json(myEvents.map(exporters.event));
});

router.post('/:id', async function(req, res){
  const body = req.body;

  var event = await getEventByID(req.params.id);

  if(!event){
    res.status(400).send("Event does not exist");
    return;
  }

  if(!userIsInEvent(req.user, event)){
    res.status(400).send("User is not in event");
    return;
  }

  res.json(exporters.event(event));
});

router.post('/', async function(req, res){
  const body = req.body;
  if(!body.title || !body.date){
    res.status(400).send("Invalid params");
    return;
  }
  var evid = makeid(6);
  var event = await db.Event.create({
    eventCode: evid,
    title: body.title,
    description: body.description,
    date: Date.parse(body.date)
  });
  await event.setOwner(req.user);
  await event.setUsers([req.user]);

  //For some reason it doesn't send back the right thing
  //if this line isn't here
  event = await getEventByID(evid);

  res.json(exporters.event(event));
})

router.post('/:id/join', async function(req,res){
  const body = req.body;

  const event = await db.Event.findOne({
    where:{
      eventCode: req.params.id
    },
    include:[{
      model: db.User,
      as:'users'
    },{
      model: db.User,
      as:'owner'
    },{
      model:db.Task,
      as:'Tasks'
    }]
  })

  if(!event){
    res.status(400).send("Event does not exist");
    return;
  }

  if(userIsInEvent(req.user, event)){
    res.status(400).send("User is in event already!");
    return;
  }

  event.addUser(req.user);

  res.json(exporters.event(event));
})

module.exports = router;
