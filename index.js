// Main file where the server is started and the routes are defined

var express  = require('express');
var app      = express();
var gravatar = require('gravatar');
var http     = require('http').Server(app);
var io       = require('socket.io')(http);

// Open the server
http.listen(5000);

// code for heroku
var port = process.env.PORT || 5000;

// Show the app is running
console.log('Running on http://localhost:' + port);

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views/pages');

app.get('/', function(req, res) {
  console.log('connected');
  res.render('home.ejs');
});

app.get('/create', function(req, res) {
  // Generate id for the chat room
  var id = Math.round((Math.random() * 1000000));

  // Redirect to chat room
  res.redirect('/chat/' + id);
});

app.get('/chat/:id', function(req, res) {
  // Send the chat page
  res.render('chat.ejs');
});

// new socket.io application
var chat = io.on('connection', function(socket) {
  socket.on('load', function(data) {
    var room = findClientsSocket(io, data);
    if (room.length <= 1) {
      socket.emit('peopleinchat' , {
        number: 1,
        user: room[0].username,
        avatar: room[0].avatar,
        id: data
      });
    }
    else if (room.length >= 2) {
      chat.emit('tooMany', {boolean: true});
    }
  });

  // Login
  socket.on('login', function(data) {
    var room = findClientsSocket(io, data.id);
    if (room.length < 2) {
      socket.username = data.user;
      socket.room = data.id;
      socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

      // Which avatar?
      socket.emit('img', socket.avatar);

      // Add client to room
      socket.join(data.id);

      if (room.length <= 1) {
        var usernames = [],
            avatars   = [];

        usernames.push(room[0].username);
        usernames.push(socket.username);

        avatars.push(room[0].avatar);
        avatars.push(socket.avatar);

        // Send startChat to start the room
        chat.in(data.id).emit('startChat', {
          boolean: true,
          id: data.id,
          users: usernames,
          avatars: avatars
        });
      }
    } else {
      socket.emit('tooMany', {boolean: true});
    }
  });

  // Leaving chat
  socket.on('disconnect', function() {
    socket.broadcast.to(this.room).emit('leave', {
      boolean: true,
      room: this.room,
      user: this.username,
      avatar: this.avatar
    });

    socket.leave(socket.room);
  });

  // Send message
  socket.on('msg', function(data) {
    socket.broadcast.to(socket.room).emit('recieve', {msg: data.msg, user: data.user, img: data.img});
  });
});

function findClientsSocket(io, roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default is home

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
        // ns.connected[id].rooms is an object!
        var rooms = Object.values(ns.connected[id].rooms);  
        var index = rooms.indexOf(roomId);				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}