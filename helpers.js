const db =  require("./models/index.js");

function userIsInEvent(user, event){
  var myId = user.id;
  return event.users.some(userInEvent=>{
    return myId === userInEvent.id;
  })
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


function makeid(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

module.exports={
  makeid: makeid,
  userIsInEvent: userIsInEvent,
  getEventByID: getEventByID
}
