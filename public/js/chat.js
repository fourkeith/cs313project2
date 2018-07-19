$(function () {
	let socket = io();
	let name = '';
	let nameInput = $('#name-input');
	let chatInput = $('#chat-input');
	let leave     = $('#leave-room');
 
	// handle name entered with enter button
	nameInput.keydown(function(event) {
	  if (event.which == 13) {
		 event.preventDefault();
 
		 // ensure message not empty
		 if (nameInput.val() !== '') {
			name = nameInput.val();
			nameInput.val('');
			$('.enter-name').hide();
			socket.emit('new:member', name);
		 }
	  }
	});
 
	// handle name entered with enter key
	$('.submit-name').on('click', function(event) {
	  event.preventDefault();
 
	  // ensure message not empty
	  if (nameInput.val() !== '') {
		 name = nameInput.val();
		 nameInput.val('');
		 $('.enter-name').hide();
		 socket.emit('new:member', name);
	  }
	});

	// handle leave with enter button
	leave.keydown(function(event) {
		if (event.which == 13) {
			event.preventDefault();
		}

		socket.emit('member', name);
		$('.enter-name').show();
	});

	// handle leave with enter key
	$('.leave-chat-button').on('click', function(event) {
		event.preventDefault();

		socket.emit('member', name);
		$('.enter-name').show();
	});

	// handle leave when tab closes
	$(window).on('unload', function(event) {
		event.preventDefault();
		socket.emit('member', name);
		$('.enter-name').show();
	});
 
 
	// handle keyboard enter button being pressed
	chatInput.keydown(function(event) {
	  if (event.which == 13) {
		 event.preventDefault();
 
		 // ensure message not empty
		 if (chatInput.val() !== '' && name !== '') {
			socket.emit('chat', {name: name, msg: chatInput.val()});
			chatInput.val('');
		 }
	  }
	});
 
	// handle submit chat message button being clicked
	$('.submit-chat-message').on('click', function(event) {
	  event.preventDefault();
 
	  // ensure message not empty
	  if (chatInput.val() !== '' && name !== '') {
		 socket.emit('chat', {name: name, msg: chatInput.val()});
		 chatInput.val('');
	  }
	});

	// handle receiving new messages
	socket.on('chat', function(msgObject){
	  $('#messages').append($('<div class="msg new-chat-message">').html('<span class="member-name">' + msgObject.name + '</span>: ' + msgObject.msg));
		$('.chat-window').scrollTop($('#messages').height());
	});
 
	// handle member joining
	socket.on('new:member', function(name){
	  $('#messages').append($('<div class="msg new:member">').text(name + ' has joined the room'));
	  $('.chat-window').scrollTop($('#messages').height());
	});

	// handle member leaving
	socket.on('member', function(name){
		$('#messages').append($('<div class="msg member">').text(name + ' has left the room'));
	  $('.chat-window').scrollTop($('#messages').height());
	})
 });