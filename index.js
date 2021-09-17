/*

	Copyright © 2021 Berny23
	
	This file is part of "ToyPad Emulator for Lego Dimensions" which is released under the "MIT" license.
	See file "LICENSE" or go to "https://choosealicense.com/licenses/mit" for full license details.

*/

const ld = require ('node-ld')
const path = require('path');
const express = require('express');
const app = express();

var tp = new ld.ToyPadEmu()
tp.registerDefaults()

function createVehicle(id, upgrades, uid){
	upgrades = upgrades || [0,0];
	var token = new Buffer(180);
	token.fill(0);
	token.uid = uid;
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


//When the game calls 'CMD_WRITE', writes the given data to the toytag in the top position.
tp._hook(tp.CMD_WRITE, (req, res) => {
	var ind = req.payload[0];
	var page = req.payload[1];
	console.log('REQUEST (CMD_WRITE): index:', ind, 'page', page);
	res.payload = new Buffer('00', 'hex');
	var token = tp._tokens.find(t => t.index == ind);
	if (token)
		req.payload.copy(token.token, 4 * page, 2, 6);
});

app.use(express.json());

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/character', (request, response) => {
	console.log('Placing character: ' + request.body.id);
	var uid = tp.randomUID();
	var character = createCharacter(request.body.id, uid);
	tp.place(character, request.body.position, request.body.index, character.uid);
	console.log('Character placed: ' + request.body.id);
	response.send(uid);
});

app.post('/vehicle', (request, response) => {
	console.log('Placing vehicle: ' + request.body.id);
	var uid = tp.randomUID();
	var vehicle = createVehicle(request.body.id, [0xEFFFFFFF, 0xEFFFFFFF], uid);
	tp.place(vehicle, request.body.position, request.body.index, vehicle.uid);
	console.log('Vehicle placed: ' + request.body.id);
	response.send(uid);
});

app.put('/character', (request, response) => {
	console.log('Changing character: "' + request.body.uid + '" to position ' + request.body.position + ', index ' + request.body.index);
	var character = createCharacter(request.body.id, request.body.uid);
	tp.place(character, request.body.position, request.body.index, character.uid);
	console.log('Character changed: "' + request.body.uid + '" to position ' + request.body.position + ', index ' + request.body.index);
});

app.put('/vehicle', (request, response) => {
	console.log('Changing vehicle: "' + request.body.uid + '" to position ' + request.body.position + ', index ' + request.body.index);
	var vehicle = createVehicle(request.body.id, [0xEFFFFFFF, 0xEFFFFFFF], request.body.uid);
	tp.place(vehicle, request.body.position, request.body.index, vehicle.uid);
	console.log('Vehicle changed: "' + request.body.uid + '" to position ' + request.body.position + ', index ' + request.body.index);
});

app.delete('/remove', (request, response) => {
	console.log('Removing item: ' + request.body.index);
	tp.remove(request.body.index);
	console.log('Item removed: ' + request.body.index);
	response.send(true);
});

app.listen(80, () => console.log('Server running on port 80'));
