var express = require('express');
var router = express.Router();
const db =  require("../models/index.js");
var exporters = require("../createJSON.js");
const h = require("../helpers");

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

  var myEvents = allEvents.filter(event=>h.userIsInEvent(req.user,event));
  res.json(myEvents.map(exporters.event));
});

router.put('/:id',async function(req, res){
  var body = req.body;
  var event = await h.getEventByID(req.params.id);

  if(!event){
    res.status(400).send("Event does not exist");
    return;
  }

  if(event.owner.id !== req.user.id){
    res.status(400).send("You do not have permission to modify this event.");
    return;
  }

  var toUpdate = {};

  if(typeof(body.title) !== "undefined"){
    toUpdate.title = body.title;
  }
  if(typeof(body.description) !== "undefined"){
    toUpdate.description = body.description;
  }
  if(typeof(body.date) !== "undefined"){
    toUpdate.date = new Date(body.date);
  }
  if(typeof(body.location) !== "undefined"){
    toUpdate.location = body.location;
  }

  await event.update(toUpdate);

  res.json(exporters.event(event));

})

router.delete('/:id', async function(req, res){
  var event = await h.getEventByID(req.params.id);

  if(!event){
    res.status(400).send("Event does not exist");
    return;
  }

  if(event.owner.id !== req.user.id){
    res.status(400).send("You do not have permission to delete this event.");
    return;
  }

  await event.destroy();

  res.status(200).send("OK");

})

router.post('/:id', async function(req, res){
  const body = req.body;

  var event = await h.getEventByID(req.params.id);

  if(!event){
    res.status(400).send("Event does not exist");
    return;
  }

  if(!h.userIsInEvent(req.user, event)){
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
  var evid = h.makeid(6);
  var event = await db.Event.create({
    eventCode: evid,
    title: body.title,
    description: body.description,
    date: Date.parse(body.date),
    location: body.location
  });
  await event.setOwner(req.user);
  await event.setUsers([req.user]);

  //For some reason it doesn't send back the right thing
  //if this line isn't here
  event = await h.getEventByID(evid);

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

  if(h.userIsInEvent(req.user, event)){
    res.status(400).send("User is in event already!");
    return;
  }

  event.addUser(req.user);

  res.json(exporters.event(event));
})

module.exports = router;
