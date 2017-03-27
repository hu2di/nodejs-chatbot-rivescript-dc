var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Include .html file
app.get('/', function(req, res) {
	//res.send('<h1>RoboChat</h1>');
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
	//User connected
	console.log('A user connected! id = ' + socket.id);
	robotAnswer(socket, "", "");
	
	//User disconnected
	socket.on('disconnect', function() {
		console.log('A user disconnected! id = ' + socket.id);
	});
	
	//Show message send from user
	socket.on('new message', function(strJson) {
		robotAnalyze(socket, strJson);
	});
});

//Robot Analyze
function robotAnalyze(socket, strJson) {
	var json = JSON.parse(strJson);
	var username = json.username;
	var message = json.message;
	message = change_alias(message);
	console.log(username + ">" + message);
		
	robotAnswer(socket, username, message);
}

//Convert tieng viet
function change_alias(alias) {
	var str = alias;
	str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
    str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
    str = str.replace(/đ/g,"d");
	str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g," ");
    str = str.replace(/ + /g," ");
    str = str.trim();
	return str;
}

//RiveBot
var RiveScript = require("rivescript-dc");
var bot = new RiveScript();
bot.loadFile("rs-standard.rive", loading_done, loading_error);

function loading_done (batch_num) {
	console.log("Batch #" + batch_num + " has finished loading!");
	bot.sortReplies();
	var reply = bot.reply("local-user", "xin chao");
	console.log("The bot says: " + reply);
}

function loading_error (batch_num, error) {
	console.log("Error when loading files: " + error);
}

//Robot answer
function robotAnswer(socket, username, message) {
	var reply;
	if (message == "") {
		reply = "Hi there."
	} else {
		reply = bot.reply(username, message);
	}
	console.log("Bot>", reply);
	var strJson = '{ "username": "Robot", "message": "' + reply + '" }';;
	io.to(socket.id).emit('new message', strJson);
}

//Listen port 3000
http.listen(3000, function() {
	console.log('listening on *:3000');
});