var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);


const Cards = require("./cardArray.js");

const moods = Cards.mood;
const arc = Cards.arc;
const terrain = Cards.terrain;
const obj = Cards.obj;

const playingCards = [arc, terrain, obj, moods];

//variables for the timer
var counter;
var timerAmount;
var timeInterval;

app.use(express.static('public'));


app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'views/index.html'));
});


var cards = [];


io.on('connection', function(socket) {
  
  
  io.sockets.emit('deal cards', cards);
  
  socket.on('deal', function(d) {
    dealCards();
    
    io.sockets.emit('deal cards', cards);
  });
  
    socket.on('start timer', function(d) {
      io.sockets.emit('freeze buttons');
      counter = 120;//in game should be 120 - 2 minutes
      timerAmount = 0;
      timeInterval = setInterval(myTimer, 1000);
      

    });  
  
   socket.on('disconnect', function() {
     
     if(io.engine.clientsCount === 0){
       cards.length = 0;
     }
    
     
     
  });
  
  
}); //END OF SOCKET ON

function dealCards(){
      //empty the card array so not building up an array
    cards.length = 0;
    
      for(var i = 0; i < playingCards.length; i++){
      
      var cardType = playingCards[i];
      var x = Math.floor(Math.random() * (cardType.length -1)) + 1;
      
      cards.push({
        letter: cardType[0].letter,
        name: cardType[0].name,
        item: cardType[x].item,
        timeFrame: cardType[x].timeFrame
      });
      
    }
}

function myTimer() {
  counter--;
  timerAmount = timerAmount + 0.835;
  console.log(counter);
  io.sockets.emit('timer go', timerAmount);
  if(counter <= 0){
    clearInterval(timeInterval);
    console.log('leaving');
    io.sockets.emit('timer reset');
  }
}

server.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + server.address().port);
});