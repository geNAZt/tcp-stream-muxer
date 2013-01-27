var spawn = require('child_process').spawn;

//Spawn the Server
var server    = spawn('node', [__dirname + '/server.js']);

server.stdout.on('data', function (data) {
    console.log('server: ' + data);
});

server.stderr.on('data', function (data) {
    console.log('server err: ' + data);
});

server.on('exit', function (code) {
    console.log('server child process exited with code ' + code);
});

//Spawn the Client
var client = spawn('node', [__dirname + '/client.js']);

client.stdout.on('data', function (data) {
    console.log('client: ' + data);
});

client.stderr.on('data', function (data) {
    console.log('client err: ' + data);
});

client.on('exit', function (code) {
    console.log('client child process exited with code ' + code);
});