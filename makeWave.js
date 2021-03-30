const fs = require('fs');
const async = require('async');
const tone = require('tonegenerator');
const header = require('waveheader');
var argv = require('minimist')(process.argv.slice(2));

if (!argv.name) {
	console.log("please provide the --name of the file");
	return;
} 

var data = fs.readFileSync("./output/data/" + argv.name + ".csv", "utf8").split(/[\n\r]+/g).map(d => { return parseFloat(d); });

// Python's csv output leaves an empty row at the end
data.pop();

var duration = 1024 / 44100;

var file = fs.createWriteStream('./output/sounds/' + argv.name + '.wav')

file.write(header(data.length * 1034 * 2, {
	bitDepth: 16
}));

async.eachSeries(data, function(freq, callback) {
	var sample = tone({
		freq: freq,
		lengthInSecs: duration,
		volume: tone.MAX_16 / 2
	});

	var data = Int16Array.from(sample);
	var size = data.length * 2 // 2 bytes per sample

	if (Buffer.allocUnsafe) { // Node 5+
		var buffer = Buffer.allocUnsafe(size)
	} else {
  		var buffer = new Buffer(size)
	}

	data.forEach(function (value, index) {
  		buffer.writeInt16LE(value, index * 2)
	});

	file.write(buffer);
	callback();
}, function() {
	console.log("Finished");
	file.end();
});