/*
	Copyright © 2021 Berny23
	
	This file is part of "ToyPad Emulator for Lego Dimensions" which is released under the "MIT" license.
	See file "LICENSE" or go to "https://choosealicense.com/licenses/mit" for full license details.
*/

const ld = require ('node-ld')
const fs = require('fs');
const path = require('path');
const { DH_CHECK_P_NOT_PRIME } = require('constants');

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const toytagFileName = './server/json/toytags.json';

var tp = new ld.ToyPadEmu()
tp.registerDefaults()

initalizeToyTagsJSON();

function createVehicle(id, upgrades, uid){
	upgrades = upgrades || [0,0];
	var token = new Buffer(180);
	token.fill(0);
	token.uid = uid;
	console.log(upgrades);
	token.writeUInt32LE(upgrades[0],0x23*4);
	token.writeUInt16LE(id,0x24*4);
	token.writeUInt32LE(upgrades[1],0x25*4);
	token.writeUInt16BE(1,0x26*4);
	return token;
}

function createCharacter(id, uid){
	var token = new Buffer(180)
	token.fill(0); // Game really only cares about 0x26 being 0 and D4 returning an ID
	token.uid = uid;
	token.id = id;
	return token;
}

function getNameFromID(id){
	if(id < 1000)
		dbfilename = './server/json/charactermap.json';
	else
		dbfilename = './server/json/tokenmap.json';
	var name = "test";
	const data = fs.readFileSync(dbfilename, 'utf8');
	const databases = JSON.parse(data);
	databases.forEach(db => {
		if(id == db.id){
			name = db.name
		}
    });

	return name;
}

function getJSONFromUID(uid){
	const data = fs.readFileSync(toytagFileName, 'utf8');
	const databases = JSON.parse(data);
	var entry;
	databases.forEach(db => {
		if(db.uid==uid)
			entry = db;
    });
	return entry;
}

function updatePadIndex(uid, index){
	console.log('Planning to set UID: ' + uid + ' to index ' + index);
	const data = fs.readFileSync(toytagFileName, 'utf8');
	const databases = JSON.parse(data);
	databases.forEach(db => {
		if(uid == db.uid){
			db.index = index;
		}
    });
	fs.writeFileSync(toytagFileName, JSON.stringify(databases, null, 4), function(){
		console.log('Set UID: ' + uid + ' to index ' + index);
	})
}

function getUIDFromIndex(index){
	const data = fs.readFileSync(toytagFileName, 'utf8');
	const databases = JSON.parse(data);
	var uid;
	databases.forEach(db => {
		if(index == db.index){
			uid = db.uid;
		}
    });
	return uid;
}

function writeJSONData(uid, datatype, data){
	console.log('Planning to set '+  datatype + ' of ' + uid + ' to ' + data);
	const tags = fs.readFileSync(toytagFileName, 'utf8');
	const databases = JSON.parse(tags);
	databases.forEach(db => {
		if(uid == db.uid){
			db[datatype] = data;
			return;
		}
    });
	fs.writeFileSync(toytagFileName, JSON.stringify(databases, null, 4), function(){
		console.log('Set '+  datatype + ' of ' + uid + ' to ' + data);
	})
}

function initalizeToyTagsJSON(){
	const data = fs.readFileSync(toytagFileName, 'utf8');
	const databases = JSON.parse(data);
	databases.forEach(db => {
		db.index = "-1";
    });
	fs.writeFileSync(toytagFileName, JSON.stringify(databases, null, 4), function(){
		console.log("Initalized toytags.JSON");
	})
}

//When the game calls 'CMD_WRITE', writes the given data to the toytag in the top position.
tp.hook(tp.CMD_WRITE, (req, res) => {
	var ind = req.payload[0];
	var page = req.payload[1];
	var data = req.payload.slice(2);
	var uid = getUIDFromIndex('2');
	console.log('REQUEST (CMD_WRITE): index:', ind, 'page', page, 'data', data);

	if(page == 24 || page == 36){
		writeJSONData(uid,"id",data.readInt16LE(0));
		var name = getNameFromID(data.readInt16LE(0));
		writeJSONData(uid,"name",name);
		writeJSONData(uid,"type","vehicle");
		//writeVehicleData(uid, "uid", tp.randomUID())
	}
	else if(page == 23 || page == 35)
		writeJSONData(uid, "vehicleUpgradesP23", data.readUInt32LE(0));
	else if (page == 25 || page == 37){
		writeJSONData(uid, "vehicleUpgradesP25", data.readUInt32LE(0));
		io.emit("refreshTokens");
	}

	res.payload = new Buffer('00', 'hex');
	var token = tp._tokens.find(t => t.index == ind);
	if (token){
		req.payload.copy(token.token, 4 * page, 2, 6);
	}
		
});

app.use(express.json());

app.use(express.static(path.join(__dirname, 'server')))

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, 'server/index.html'));
});

app.post('/character', (request, response) => {
	console.log('Creating character: ' + request.body.id);
	var uid = tp.randomUID();
	var character = createCharacter(request.body.id, uid);
	var name = getNameFromID(request.body.id, "character");

	console.log("name: " + name, " uid: " + character.uid, " id: " + character.id)

	fs.readFile(toytagFileName, 'utf8', (err, data) => {
		if(err){
			console.log(err)
		}
		else{
			const tags = JSON.parse(data.toString());

			tags.push({
				name: name,
				id: character.id,
				uid: character.uid,
				index: "-1",
				type: 'character',
				vehicleUpgradesP23: 0,
				vehicleUpgradesP25: 0
			});

			fs.writeFile(toytagFileName, JSON.stringify(tags, null, 4), 'utf8', (err) => {
				if (err) {
					console.log(`Error writing file: ${err}`);
				} else {
					console.log(`File is written successfully!`);
				}
			});
		}
	})

	console.log('Character created: ' + request.body.id);
	response.send();
});

app.post('/characterPlace', (request, response) => {
	console.log('Placing tag: ' + request.body.id);
	var entry = getJSONFromUID(request.body.uid);

	console.log(entry.type);

	if(entry.type == "character"){
		var character = createCharacter(request.body.id, request.body.uid);
		tp.place(character, request.body.position, request.body.index, character.uid);
		console.log('Character tag: ' + request.body.id);
		updatePadIndex(character.uid, request.body.index);
		response.send();
	}
	else{
		var vehicle = createVehicle(request.body.id,[entry.vehicleUpgradesP23, entry.vehicleUpgradesP25],request.body.uid);
		tp.place(vehicle, request.body.position, request.body.index, vehicle.uid);
		console.log('Vehicle tag: ' + request.body.id);
		updatePadIndex(vehicle.uid, request.body.index);
		response.send();
	}
})

app.post('/vehicle', (request, response) => {
	console.log('Placing vehicle: ' + request.body.id);
	var uid = tp.randomUID();
	var vehicle = createVehicle(request.body.id, [0xEFFFFFFF, 0xEFFFFFFF], uid);
	var name = getNameFromID(request.body.id, "vehicle");

	console.log("name: " + name, " uid: " + vehicle.uid, " id: " + vehicle.id)

	fs.readFile(toytagFileName, 'utf8', (err, data) => {
		if(err){
			console.log(err)
		}
		else{
			const tags = JSON.parse(data.toString());
			var entry = {
				name: name,
				id: request.body.id,
				uid: vehicle.uid,
				index: "-1",
				type: 'vehicle',
				vehicleUpgradesP23: 0xEFFFFFFF,
				vehicleUpgradesP25: 0xEFFFFFFF
			}

			console.log(entry)
			tags.push(entry);

			fs.writeFile(toytagFileName, JSON.stringify(tags, null, 4), 'utf8', (err) => {
				if (err) {
					console.log(`Error writing file: ${err}`);
				} else {
					console.log(`File is written successfully!`);
				}
			});
		}
	})
	console.log('Vehicle placed: ' + request.body.id);
	response.send(uid);
});

app.delete('/remove', (request, response) => {
	console.log('Removing item: ' + request.body.index);
	console.log('DEBUG: pad-from-token: ', tp._tokens.filter(v => v.index == request.body.index)[0].pad);
	tp.remove(request.body.index);
	console.log('Item removed: ' + request.body.index);
	updatePadIndex(request.body.uid, "-1");
	response.send(true);
});

io.on('connection', (socket) => {
	socket.on('deleteToken', (uid) => {
		console.log('IO Recieved: Deleting entry '+  uid + ' from JSON');
		const tags = fs.readFileSync(toytagFileName, 'utf8');
		const databases = JSON.parse(tags);
		var index = -1;
		var i = 0;
		databases.forEach(db => {
			if(uid == db.uid){
				index = i;
				return;
			}
			i++;
		});
		console.log('Entry to delete: ', index)
		if (index > -1) {
			databases.splice(index, 1);
		  }
		fs.writeFileSync(toytagFileName, JSON.stringify(databases, null, 4), function(){
			if (index > -1)
				console.log('Token not found');
			else
				console.log('Deleted ', uid, ' from JSON');
		})
		io.emit("refreshTokens");
	});
});

server.listen(80, () => console.log('Server running on port 80'));
