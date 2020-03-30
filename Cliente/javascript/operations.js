var usrName = 'Elizabeth Bishop';

function fade(element, element2Unfade) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
			element.classList.add('is-hidden');
			unfade(element2Unfade);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

function unfade(element) {
	var op = 0.1;  // initial opacity
	element.style.opacity = op;
    element.classList.remove('is-hidden');
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}

function ingresar(){
	document.getElementById('name').style.opacity = 0.1;
	fade(document.getElementById('ingresar'), document.getElementById('name'));
}

function messageCreator(message) {
	
	let nodeMes = document.createElement("div");
	let nodeMesName = document.createElement("div");
	let nodeMesText = document.createElement("div");
	let file_image_wrapper = document.createElement("div");
	let node_image = document.createElement("i");
	let node_p = document.createElement("p");
	let file = document.createElement('a');
	let name;
	let mesg;
	let fromWhom =  'messages-area';
	nodeMes.classList.add("message");                					// Create a <div> node
	nodeMesName.classList.add("name");
	nodeMesText.classList.add("text");
	if (message == null){ 
		name = document.createTextNode(usrName);
		mesg = document.createTextNode(document.getElementById('usrMessage').value);
		nodeMes.classList.add("self");
		fromWhom =  chat_area_on; //Define on udpSocket
		nodeMesText.appendChild(mesg);
	}else{
		if(message.to != ('messages-area-' + usrName) && message.to != 'messages-area') return;
		name = document.createTextNode(message.user);
		mesg = document.createTextNode(message.mesg);
		fromWhom = ( message.to == 'messages-area')? 'messages-area':'messages-area-' + message.user;
		
		if(message.file == null)
			nodeMesText.appendChild(mesg);
		else{
			let path_ = '';
			node_image.classList.add('fas', 'fa-file');
			node_image.style.display = 'inline';
			node_p.innerHTML = message.mesg;
			file_image_wrapper.appendChild(node_image);
			file_image_wrapper.appendChild(node_p);
			file.appendChild(file_image_wrapper);
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
		}
	}
	
	
	nodeMesName.appendChild(name);
	nodeMes.appendChild(nodeMesName);
	nodeMes.appendChild(nodeMesText);
	document.getElementById(fromWhom).appendChild(nodeMes); 
}

