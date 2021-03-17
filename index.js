const axios = require('axios');
const WebSocket = require('ws');
let token;
let ws;
let prefix;
const status_stuff = {
	"op": 3,
	"d": {
		"since": 91879201,
		"activities": [{
			"name": "Save the Oxford Comma",
			"type": 0
		}],
		"status": "online",
		"afk": false
	}
}

//let start = () => {};
//let message_event = () => {};
const event = {};
const events = {};
event.create = (name, func) => {
	events[name] = func;
}
const command = {};
const commands = {};
const permissions = {};
command.permissions = {};

command.prefix = (prfx) => { prefix = prfx; }
command.create = (name, func, perms) => {
	commands[name] = func;
	if (perms) permissions[name] = perms;
}
command.execute = (message, name) => {
	if (!name) name = message.content.slice(prefix.length).split(' ')[0];
	args = message.content.slice(prefix.length-1).split(' ').slice(1);
	if (commands[name]) commands[name](message, args);
}
command.permissions.add = (name, perms) => {
	for (const perm of perms) {
		permissions[name].push(perm);
	}
}
command.permissions.set = (name, perms) => {
	permissions[name] = perms;
}

ban = async ({guild, user, delete_days, reason}) => {
	if (!delete_days) delete_days = 7;
	if (!reason) reason = 'No reason provided.'
	await axios.post(`https://discord.com/api/guilds/${guild}/bans/${user}`,
		{
			'delete_message_days': delete_days,
			'reason': reason
		}
		,
		{headers: {
			"Authorization": `Bot ${token}`
		}}
	)
}

modify_status = (arr) => {
	for (const [key, value] of arr) {
		switch (key) {
			case 'since':
				status_stuff['d']['since'] = value;
				break;
			
			case 'status_message':
				status_stuff['d']['activities'][0]['name'] = value;
				break;
			
			case 'status_type':
				status_stuff['d']['activities'][0]['type'] = value;
				break;
			
			case 'appearance':
				status_stuff['d']['status'] = value;
				break;
			
			case 'afk':
				status_stuff['d']['afk'] = value;
				break;
		}
	}
	ws.send(JSON.stringify(status_stuff));
} 

send_message = async ({message, tts, channel, embed}) => {
	data = {
			"content": message,
			"tts": tts
		}
	if (embed) data.embed = embed;
	await axios.post(`https://discord.com/api/channels/${channel}/messages`,
		data
		,
		{headers: {
			"Authorization": `Bot ${token}`
		}}
			
	)
}

login = async (tkn) => {
	token = tkn;
	ws = new WebSocket('wss://gateway.discord.gg/?v=6&encoding=json');
	let interval_set = false;
	ws.on('message', async function incoming(data) {
		data = JSON.parse(data);
		msg = data.d;
		_event = data.t;

		if (_event === null) {
			if (interval_set === false) {
				setInterval(
					function () {
						ws.send('{"op": 1, "d": null}')
					}, 
					msg.heartbeat_interval
				);
					ws.send(`
						{
							"op": 2,
							"d": {
								"token": "${token}",
								"intents": 513,
								"properties": {
									"$os": "linux",
									"$browser": "my_library",
									"$device": "my_library"
								}
							}
						}
					`);
				interval_set = true;
			} else {
			}
		} else {
			//console.log(_event);
			if (events[_event]) events[_event](data.d);
			
		}
	});
} 
	




module.exports.event = event;
module.exports.send_message = send_message;
module.exports.modify_status = modify_status;
module.exports.login = login;
module.exports.command = command;
module.exports.ban = ban;