const fs = require('fs');
const youtubedl = require('youtube-dl');
const ffmpeg = require('fluent-ffmpeg');
var argv = require('minimist')(process.argv.slice(2));

argv.start = argv.start || 0;

if (!argv.end) {
	console.log("enter the finish time in seconds.");
	return;
}

if (!argv.name) {
	console.log("enter a name for the sample.");
	return;
}

if (!argv.url) {
	console.log("enter a YouTube url for the sample.");
	return;
}

var duration = +argv.end - +argv.start;

console.log("Downloading audio...");

youtubedl.exec(argv.url, ['-x', '--audio-format', 'wav'], {}, function exec(err, output) {
    if (err) { throw err; }
    var filename = output.slice(-2,-1)[0].replace("[ffmpeg] Destination: ", "");
    console.log("Clipping audio");
    ffmpeg(filename)
		.setStartTime(+argv.start)
		.setDuration(duration)
		.output('samples/' + argv.name + '.wav')
		.on('end', function(err) {
        	if(!err) {
	            console.log('conversion done');
	            fs.unlinkSync(filename);
    	    }
    	})
		.on('error', function(err){
			console.log('error: ', +err);
		}).run();
});