module.exports = {
  user: function(user){
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      uname: user.uname
    }
  },
  event: function(event){
    return {
      eventCode: event.eventCode,
      description: event.description,
      date: event.date
    }
  },
  task: function(task){
    return {};
  }
}
