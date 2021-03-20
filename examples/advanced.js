startup_channel = '';

const { event, send_message, modify_status, login, command, ban, getroles, kick } = require('./utils');
const axios = require('axios');
const env = require('dotenv');
const fs = require('fs');
event.create('READY', async () => {
	console.log('boop')
	await send_message({
		message: 'Bot is now sleeping',
		tts: false,
		channel: startup_channel
	});
	await modify_status(
		[
			['appearance', 'dnd'],
			['status_message', 'eklfjsa;dja']
		]
	);
});

command.prefix('m.')

command.create('ban', async (message, args) => {
	const permissions = JSON.parse(fs.readFileSync('./permissions.json').toString());
	check = [];
	for (const role of message.member.roles) {
		console.log(role);
		if (!permissions[role]) check.push(false);
		else if (permissions[role]['ban'] === true) check.push(true);
		else check.push(false);
	}
	console.log(check)
	if (check.includes(true)) {
		try {
			await ban({
				user: args[0].match(/\d{16,23}/),
				reason: args.slice(1).join(' '),
				guild: message.guild_id
			});
			await send_message({
				message: 'Successfully banned user',
				channel: message.channel_id,
				tts: false
			});
		} catch (err) {
			console.log(err);
			await send_message({
				message: 'An error has occured while trying to execute this command',
				tts: false,
				channel: message.channel_id
			});
		}
			
	}
	else await send_message({
		message: 'Invalid permissions!',
		channel: message.channel_id,
		tts: false
	});
});
command.create('kick', async (message, args) => {
	const permissions = JSON.parse(fs.readFileSync('./permissions.json').toString());
	check = [];
	for (const role of message.member.roles) {
		if (!permissions[role]) check.push(false);
		else if (permissions[role]['kick'] === true) check.push(true);
		else check.push(false);
	}
	if (check.includes(true)) {
		try {
			await kick({
				user: args[0].match(/\d{16,23}/),
				reason: args.slice(1).join(' '),
				guild: message.guild_id
			});
			await send_message({
				message: 'Successfully kicked user',
				channel: message.channel_id,
				tts: false
			});
		} catch (err) {
			console.log(err);
			await send_message({
				message: 'An error has occured while trying to execute this command',
				channel: message.channel_id,
				tts: false
			});
		}
			
	}
	else await send_message({
		message: 'Invalid permissions!',
		channel: message.channel_id,
		tts: false
	});
});

command.create('warn', async (message, args) => {
	const permissions = JSON.parse(fs.readFileSync('./permissions.json').toString());
	const warns = JSON.parse(fs.readFileSync('./warns.json').toString());
	check = [];
	for (const role of message.member.roles) {
		if (!permissions[role]) check.push(false);
		else if (permissions[role]['warn'] === true) check.push(true);
		else check.push(false);
	}
	
	if (!args[0]) return await send_message({
		message: 'No subcommand specified! Available subcommands: `add`, `remove`, `list`',
		channel: message.channel_id,
		tts: false
	});
	console.log(args[1]);
	id = args[1].match(/\d{16,23}/)[0];
	console.log(id);
	if (!id) return await send_message({
		message: 'Invalid user specified!',
		channel: message.channel_id,
		tts: false
	});
	if (check.includes(true)) {
		if (!warns[id]) {
			if (args[0] === 'remove' || args[0] === 'list') {
				return await send_message({
					message: 'Specified user has no warns!',
					channel: message.channel_id,
					tts: false
				});
			}
			warns[id] = [];
		}
		if (args[0] === 'add') {
			if (!args[2]) return await send_message({
				message: 'No warn reason provided!',
				channel: message.channel_id,
				tts: false
			});
			warns[id].push(args.slice(2).join(' '));
			fs.writeFileSync('./warns.json', JSON.stringify(warns), err => {
				if (err) throw err;
			});
		} else if (args[0] === 'remove') {
			if (!args[2]) return await send_message({
				message: 'No warn ID provided!',
				channel: message.channel_id,
				tts: false
			});
			delete warns[id][parseInt(args[2])];
			fs.writeFileSync('./warns.json', JSON.stringify(warns), err => {
				if (err) throw err;
			});
		} else if (args[0] === 'list') {
			embed = { fields: [] }
			for (const warn in warns[id]) {
				 if (warns[id][warn]) embed['fields'].push({name: `warn id: ${warn}`, value: `${warns[id][warn]}`})
			}
			await send_message({
				message: 'boop',
				embed: embed,
				tts: false,
				channel: message.channel_id
			})
		}
	} else await send_message({
		message: 'You do not have permission to use this command!',
		channel: message.channel_id,
		tts: false
	})
});

command.create('addperm', async (message, args) => {
	
	const permissions = JSON.parse(fs.readFileSync('./permissions.json').toString());
	if (!message.author.id === '585960267741921281' || !message.author.id === '585960267741921281') return await send_message({
		message: 'You are not the bot owner/server owner!',
		channel: message.channel_id,
		tts: false
	});
	role = args[0].match(/\d{16,23}/);
	perm = args[1];
	if (!permissions[role]) permissions[role] = {};
	permissions[role][perm] = true;
	fs.writeFileSync('./permissions.json', JSON.stringify(permissions), err => {
		if (err) throw err;
	});
});
command.create('delperm', async (message, args) => {
	const permissions = JSON.parse(fs.readFileSync('./permissions.json').toString());
	if (!message.author.id === '585960267741921281' || !message.author.id === '585960267741921281') return await send_message({
		message: 'You are not the bot owner/server owner!',
		channel: message.channel_id,
		tts: false
	});
	role = args[0].match(/\d{16,23}/);
	perm = args[1];
	if (!permissions[role]) permissions[role] = {};
	permissions[role][perm] = false;
	fs.writeFileSync('./permissions.json', JSON.stringify(permissions), err => {
		if (err) throw err;
	});
});

event.create('MESSAGE_CREATE', async (message) => {
	if (message.content.toLowerCase().startsWith('m.')) {
		command.execute(message);
	}
});

login(process.env.TOKEN);