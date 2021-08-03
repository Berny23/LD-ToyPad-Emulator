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

function createVehicle(id,upgrades){
	upgrades = upgrades || [0,0]
	var token = new Buffer(180)
	token.fill(0)
	token.uid = tp.randomUID()
	token.writeUInt32LE(upgrades[0],0x23*4)
	token.writeUInt16LE(id,0x24*4)
	token.writeUInt32LE(upgrades[1],0x25*4)
	token.writeUInt16BE(1,0x26*4)
	return token;
}

function createCharacter(id){
	var token = new Buffer(180)
	token.fill(0) // Game really only cares about 0x26 being 0 and D4 returning an ID
	token.uid = tp.randomUID()
	token.id = id
	return token;
}

app.use(express.json());

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/character', (request, response) => {
	console.log('Character placed: ' + request.body.id);
	var character = createCharacter(request.body.id);
	tp.place(character, request.body.position, request.body.index, character.uid);
});

app.post('/vehicle', (request, response) => {
	console.log('Vehicle placed: ' + request.body.id);
	var vehicle = createVehicle(request.body.id, [0xEFFFFFFF, 0xEFFFFFFF]);
	tp.place(vehicle, request.body.position, request.body.index, vehicle.uid);
});

app.delete('/remove', (request, response) => {
	console.log('Item removed: ' + request.body.index);
	tp.remove(request.body.index);
});

app.listen(80, () => console.log('Server running on port 80'));