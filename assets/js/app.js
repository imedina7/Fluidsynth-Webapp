var server = self.location.host;
var socket = io.connect('http://' + server);
var instruments;
$(document).on('vclick', '#instruments li a', function(){
	var ipath = $(this).attr('data-inum');
	var fontId = $(this).attr('data-font-id');
	var iname = $(this).text();
	var channel = 15;
	socket.emit('changeinst', { channel: channel, instrumentId: ipath, fontId: fontId });
	console.log(channel);
	console.log(ipath);
	$('#instruments li a').removeClass('ui-btn-active');
	$(this).addClass('ui-btn-active');
});
socket.on('connect', function(data) {
	$.mobile.loading( 'show', { text: 'pouring fluid', textVisible: true });
	socket.emit('status', 'client connected');
	var fontId = 3;
	socket.emit('queryFont', fontId);
	socket.on('instrumentdump', function(idmp){
		$('#instruments').html("");
		var str = idmp.package;
		var instruments = str.split("\n");
		for (i=0;i < instruments.length; i++) {
			console.log(instruments[i].slice(4));
			var instrumentnumber = instruments[i].slice(4,7);
			var instrumentname = instruments[i].slice(8);
			$('#instruments').append('<li data-icon="audio"><a href="#" data-inum="' + instrumentnumber + '" data-font-id="'+fontId+'">' + instrumentname + '</a></li>').enhanceWithin();
		}
		$("#instruments").listview("refresh");
		$.mobile.loading( 'hide');
	});
  socket.on('voices', function(voices){
    $("voiceNumber").text(voices);
  });
});
socket.on('reconnecting', function() {
    $.mobile.loading( 'show', { text: 'finding fluid', textVisible: true });
})
function getinstruments(){
	socket.emit('getinstruments');
	socket.on('current', function(data){
		instruments = data.channels;
		console.log(instruments);
	});
}
