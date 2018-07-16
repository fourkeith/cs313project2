// Main file where the server is started and the routes are defined

var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);

// code for heroku
var port = process.env.PORT || 5000;

// Show the app is running
console.log('Running on http://localhost:' + port);

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views/pages');

app.get('/', function(req, res) {
  res.render('home.ejs')
});

http.listen(port, function() {
  io.on('connection', function(socket) {
    console.log('User connected');
    // New message
    socket.on('new:message', function(msgObject) {
      io.emit('new:message', msgObject);
    });

    // New member
    socket.on('new:member', function(name) {
      io.emit('new:member', name);
    });
  });
});