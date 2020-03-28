const dgram = require("dgram");
const path = require('path');
const PORT = 10000;
const MULTICAST_ADDR = "224.3.29.71";
const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });
var nameCheckedRes = false;
var users_on_chat = {usrNAme:true};
var chat_area_on = 'messagess-area';
var user_area_on = 'main-chat';
var file2sendPath = '';
var sendifile = false;
var resivingFile = false;

//socket.setMulticastLoopback(true);


socket.on("listening", function() {
	socket.addMembership(MULTICAST_ADDR);
	const address = socket.address();
	console.log(`UDP socket listening on ${address.address}:${address.port}`);
});
	
socket.on("message", function(message, rinfo) {
	try {
		console.log(`Message from: ${rinfo.address}:${rinfo.port} - ${message.toString('utf8')}`);
		let newMesg = JSON.parse(message.toString('utf8'));
		if(!newMesg.user){
			if (!nameCheckedRes && newMesg.sender === usrNAme){
				nameChecked(newMesg.res);
				updateUsers(newMesg.users);
				nameCheckedRes = newMesg.res;
			}
			else if(nameCheckedRes){
				updateUsers(newMesg.users);
			}
		}else if(newMesg.user != usrNAme){
			messageCreator(newMesg);
		}
		
	} catch (error) { console.error(error) }
});
	
socket.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

socket.bind(PORT);

function sendMessage() {
	let auxMessage = {
		'user':usrNAme,
		'mesg': document.getElementById('usrMessage').value,
		'to': chat_area_on
	};
	const message = Buffer.from(`${JSON.stringify(auxMessage)}`);
	socket.send(message, 0, message.length, PORT, MULTICAST_ADDR, function() {
		console.info(`Sending message "${message}"`);
	});
	messageCreator();
	document.getElementById('usrMessage').value = '';
}

function checkName() {
	usrNAme = document.getElementById('usrName').value;
	document.getElementById('nameBlank').style.display = 'none';
	if (usrNAme === '') {
		document.getElementById('nameBlank').style.display = 'block';
	}else{
		let auxMessage = {
			'user':usrNAme
		};
		const message = Buffer.from(`${JSON.stringify(auxMessage)}`);
		socket.send(message, 0, message.length, 10001, MULTICAST_ADDR, function() {
			console.info(`Sending message "${message}"`);
		});
	}
	
	
}
function nameChecked(result) {
	if (result) {
		document.getElementById('chat-area').style.opacity = 0.1;
		fade(document.getElementById('welcome'), document.getElementById('chat-area'));
		document.getElementById('main-chat').addEventListener('click', function(e) {
			document.getElementById(user_area_on).getElementsByClassName('chat-selector')[0].classList.remove('selected');
			document.getElementById('main-chat').getElementsByClassName('chat-selector')[0].classList.add('selected');
			document.getElementById(chat_area_on).style.display = 'none';
			document.getElementById('messagess-area').style.display = 'block';
			chat_area_on = 'messagess-area';
			user_area_on = 'main-chat';
		});
	} else {
		document.getElementById('nameInUse').style.display = 'block';
		document.getElementById('usrName').value = '';
	}
}

function updateUsers(users) {
	for (const key in users) {
		if (!users_on_chat.hasOwnProperty(key) && key != usrNAme) {
			Object.defineProperty(users_on_chat, key, 
				{value: true,
				writable: true,
				enumerable: true,
				configurable: true});
			let node_chat_selecor = document.createElement("div");
			let node_image = document.createElement("img");
			let node_a = document.createElement("a");
			let node_p = document.createElement("p");
			let node_messagess_area = document.createElement("div");
			
			node_messagess_area.classList.add('mensagess-area', 'start-hidden');
			node_messagess_area.id = 'messagess-area-' + key;
			node_chat_selecor.classList.add('chat-selector');   
			node_image.src = './images/network.svg';
			node_p.innerHTML = key;
			node_a.id = key;
			
			node_a.addEventListener('click', function(e) {
				userToSee = (e.path[2].text == null)? e.path[1].text:e.path[2].text
				changeChat(userToSee);
			});

			node_chat_selecor.appendChild(node_image);
			node_chat_selecor.appendChild(node_p);
			node_a.appendChild(node_chat_selecor);
			document.getElementById('users').appendChild(node_a);
			document.getElementById('messagess-wrapper').appendChild(node_messagess_area);
		}
	}
}

function changeChat(user) {
	document.getElementById(user_area_on).getElementsByClassName('chat-selector')[0].classList.remove('selected');
	document.getElementById(user).getElementsByClassName('chat-selector')[0].classList.add('selected');
	document.getElementById(chat_area_on).style.display = 'none';
	document.getElementById('messagess-area-' + user).style.display = 'block';
	chat_area_on = 'messagess-area-' + user;
	user_area_on = user;
}



function messageCreatorSelfFile(message) {
	
	let nodeMes = document.createElement("div");
	let nodeMesName = document.createElement("div");
	let nodeMesText = document.createElement("div");
	let file_imege_wraper = document.createElement("div");
	let node_image = document.createElement("i");
	let node_p = document.createElement("p");
	let file = document.createElement('a');
	let name;
	let fromoWhom =  'messagess-area';
	let path_ = '';
	
	nodeMes.classList.add("message");                					// Create a <div> node
	nodeMesName.classList.add("name");
	nodeMesText.classList.add("text");
	name = document.createTextNode(usrNAme);
	nodeMes.classList.add("self");
	fromoWhom =  chat_area_on; //Define on udpSocket
	
	node_image.classList.add('fas', 'fa-file')
	node_p.innerHTML = message.mesg;
	file_imege_wraper.appendChild(node_image);
	file_imege_wraper.appendChild(node_p);
	file.appendChild(file_imege_wraper);
	file.addEventListener('click', function(e) {
		if (e.path[2].text != null)
			path_ = e.path[2].text;
		else if(e.path[1].text != null)
			path_ = e.path[1].text;
		else
			path_ = e.path[3].text;
		downloadFile(path_);
	});
	nodeMesText.appendChild(file);

	
	
	nodeMesName.appendChild(name);
	nodeMes.appendChild(nodeMesName);
	nodeMes.appendChild(nodeMesText);
	document.getElementById(fromoWhom).appendChild(nodeMes); 
}