startup_channel = 'channel_id_here';

const { event, send_message, modify_status, login, command } = require('./wrapper');
const express = require('express');
const app = express();
const env = require('dotenv');


event.create('READY', async () => {
	console.log('boop')
	await send_message({
		message: 'beep boop bop',
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

command.prefix('boop.')

command.create('test', async (message, args) => {
	await send_message({
		message: 'hello hello blah blah blah',
		channel: message.channel_id,
		tts: false
	});
});

command.create('tester', async (message, args) => {
	await send_message({
		message: 'hello hello basfkld;fjasdlkafjsdlah blah blah',
		channel: message.channel_id,
		tts: false
	});
});

command.create('message_info', async (message, args) => {
	await send_message({
		message: JSON.stringify(message),
		channel: message.channel_id,
		tts: false
	});
})

command.create('member_info', async (message, args) => {
	await send_message({
		message: JSON.stringify(message.member),
		channel: message.channel_id,
		tts: false
	});
});


event.create('MESSAGE_CREATE', async (message) => {
	if (message.content.toLowerCase().startsWith('boop.')) {
		command.execute(message);
	};
});

login(process.env.TOKEN);
