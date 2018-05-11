var server = self.location.host;
var socket = io.connect('http://' + server);
var instruments;

var channel = 15;

socket.on('connect', getInstruments);

socket.on('reconnecting', function() {
	  $.mobile.loading( 'show', { text: 'finding fluid', textVisible: true });
})

function getChannels(){
	socket.emit('getinstruments');
	socket.on('current', function(data){
		instruments = data.channels;
		console.log(instruments);
	});
}
function addTabs(list) {
    list.forEach(function (tab) {

        var name = tab.tabName;
        var id = tab.tabId;
        var content = tab.tabContent;
        
        $("#navbar ul").append('<li><a href="#'+ id + '">'+name+'</a></li>').enhanceWithin().trigger('create');
        $("#tabs").append('<div id="'+ id + '">'+content+'</div>').enhanceWithin();
    });
    $("#navbar").trigger('create');
    $("#tabs").tabs('refresh');
}
function getInstruments(){

var params = self.location.hash.slice(1).split('&');

for (var i=0; i < params.length; i++) {
	if (params[i][0] == "c" && params[i][1] == "=" && params[i].length > 2)
		channel = params[i].split("=")[1];
	if (params[i][0] == "f" && params[i][1] == "=" && params[i].length > 2)
		listFont = params[i].split("=")[1];
}

$(document).ready(function () {

    $.mobile.loading( 'show', { text: 'pouring fluid', textVisible: true });
    socket.emit('status', 'client connected');

    socket.emit('queryFonts');
});

socket.on('instrumentdump', function(instrumentPackage){

    console.log(instrumentPackage);
    var tabList = [];
    var instrumentPageHtml = "";
    instrumentPackage.forEach(function(font) {

        instrumentPageHtml ='<ul data-role="listview" data-inset="true">';
        font.instruments.forEach ( function (instrument){
            instrumentPageHtml += '<li class="inst-selector" data-icon="audio"><a href="#" data-inum="' 
            + instrument.program_number
            + '" data-font-id="'
            + font.fontId
            + '" data-inst-bank="'
            + instrument.bank_number
            + '">' 
            + instrument.program_name 
            + '</a></li>';
        });
	instrumentPageHtml+='</ul>';
	tabList.push({ tabId: 'font-'+font.fontId, tabName: font.fontName, tabContent: instrumentPageHtml });

    });
    addTabs(tabList);
    $.mobile.loading( 'hide');
});
}
$(document).on('vclick', 'li.inst-selector a', function(){
	var ipath = $(this).attr('data-inum');
	var fontId = $(this).attr('data-font-id');
	var instBank = $(this).attr('data-inst-bank');
	var iname = $(this).text();
	
	socket.emit('changeinst', 
		{ channel: channel, 
		  instrumentId: ipath, 
		  fontId: fontId, 
		  bankId: instBank 
		});

	console.log(channel);
	console.log(ipath);
	$('li.inst-selector a').removeClass('ui-btn-active');
	$(this).addClass('ui-btn-active');
});
