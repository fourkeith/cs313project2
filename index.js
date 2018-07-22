// Main file where the server is started and the routes are defined

var express  = require('express');
var app      = express();
var http     = require('http').Server(app);
var io       = require('socket.io')(http);
const {Pool} = require('pg');

var pool = new Pool({
  user: 'Chatty',
  host: 'localhost',
  database: 'Chatty',
  password: 'cangetin',
  port: 5432,
});

// code for heroku
var port = process.env.PORT || 5000;

pool.query('SELECT * FROM messages', function(err, res) {
  console.log(err, res);
});

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views/pages');

app.get('/', function(req, res) {
  res.render('home.ejs')
});

http.listen(port, function() {
  // Show the app is running
  console.log('Running on http://localhost:' + port);

  io.on('connection', function (socket) {
    console.log('User connected');

    socket.on('chat', function (msg) {
      io.emit('chat', msg);
    });
  
    socket.on('new:member', function (name) {
      io.emit('new:member', name);
    });
  
    socket.on('member', function (name) {
      io.emit('member', name);
    });
  });
});