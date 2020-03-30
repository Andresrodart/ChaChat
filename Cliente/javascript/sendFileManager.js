const remote = require('electron').remote;
const fs = require("fs");
const FILE_PORT = 10002;
const FILE_ADDR = "127.0.0.1";
const file_socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
const input = document.getElementById('file-input');
var resivingFile = false;
var sendifile = false;
var readStream;
var fileToDownload = '';
var file2sendPath = '';
var writeStream;
var resivingFile = false;

// file_socket.on("listening", function() {
// 	const address = file_socket.address();
// 	console.log(
// 		`UDP file socket listening on ${address.address}:${address.port}`
// 	);
// });
file_socket.on("message", function(message, rinfo) {
	
	console.log(`Message from: ${rinfo.address}:${rinfo.port} - ${message.length}`);
	if (!resivingFile) {
		let theTextMess = message.toString();
		console.log(theTextMess);
		if (theTextMess == 'start_file_sending'){
			sendifile = true
			sendFile(file2sendPath);
		}else if(theTextMess == 'continue'){
			sendifile = true;
		}else if(theTextMess == 'sending'){
			resivingFile = true;
			document.getElementById('sending_file').style.display = 'block';
			const message = Buffer.from(`ok`);
			file_socket.send(message, 0, message.length, FILE_PORT, FILE_ADDR, function() {
				console.info(`Sending message "${message}"`);
			});
		}	
	}else{
		resvFile(message);
		if (message.length < 65000){
			writeStream.end();  
			resivingFile = false;
			console.log('Done resiving file');
			document.getElementById('sending_file').style.display = 'none';
		}
	}
	
});
file_socket.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

//file_socket.bind(FILE_PORT, FILE_ADDR);

input.onchange = e => { 
	var file = e.target.files[0];
	let auxMessage = {
		'user':usrName,
		'mesg': path.basename(file.path),
		'to': chat_area_on,
		'file':true
	};
	let message = Buffer.from(`${JSON.stringify(auxMessage)}`);
	file_socket.send(message, 0, message.length, 10002, FILE_ADDR, function() {
		console.info(`Sending message "${message}" to 10002`);
	});
	file2sendPath = file.path;
	document.getElementById('sending_file').style.display = 'block';
};

function sendFile(filePath) {
	readStream = fs.createReadStream(filePath,{ highWaterMark: 65000 });
	readStream.on('data', (chunk) => {
		file_socket.send(chunk, 0, chunk.length, 10002, FILE_ADDR, function() {
			console.info(`Sending message "${chunk.length}"`);
		});
		readStream.pause();
		setTimeout(() => {
			if (sendifile)
				readStream.resume();
		}, 1000);
		sendifile = false;
	  });
	readStream.on('end', () => {
		console.log('There will be no more data.');
		let auxMessage = {
			'user':usrName,
			'mesg': path.basename(filePath),
			'to': chat_area_on,
			'file':true
		};
		messageCreatorSelfFile(auxMessage);
		let message = Buffer.from(`${JSON.stringify(auxMessage)}`);
		socket.send(message, 0, message.length, PORT, MULTICAST_ADDR, function() {
			console.info(`Sending message "${message}"`);
		});
		document.getElementById('sending_file').style.display = 'none';
	});
}

function resvFile(data) {
	writeStream.write(data, (err)=>{
		if (err) throw err;
		let message = Buffer.from('continue');
		file_socket.send(message, 0, message.length, 10002, FILE_ADDR, function() {
			console.info(`Sending message "${message}" to 10002 to recive file`);
		});
	});
}

function downloadFile(fileName){
	fileToDownload = path.join(remote.dialog.showOpenDialog({properties: ['openDirectory']})[0], path.basename(fileName));
	if (fileToDownload != null) {
		fs.open(fileToDownload, 'w', function (err, file) {
			if (err) throw err;
			fs.close(file, (err)=>{
				if (err) throw err;
				writeStream = fs.createWriteStream(fileToDownload);
				let auxMessage = {
					'user':usrName,
					'file': fileToDownload
				};
				let message = Buffer.from(`${JSON.stringify(auxMessage)}`);
				file_socket.send(message, 0, message.length, 10002, FILE_ADDR, function() {
					console.info(`Sending message "${message}" to 10002 to recive file`);
				});
			});
		});
	}
}