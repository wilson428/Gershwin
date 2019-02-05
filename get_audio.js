const fs = require('fs');
const youtubedl = require('youtube-dl');
const ffmpeg = require('fluent-ffmpeg');
const argv = require('minimist')(process.argv.slice(2));

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

let timeStampToSeconds = function(str) {
	let seconds = 0;
	str.split(/:/g).reverse().forEach((t, c) => {
		seconds += +t * Math.pow(60, c);		
	});
	return seconds;
}

let time_start = timeStampToSeconds(argv.start || 0);
let time_end = timeStampToSeconds(argv.end);

var duration = time_end - time_start;

console.log("Downloading audio...");

youtubedl.exec(argv.url, ['-x', '--audio-format', 'wav'], {}, function exec(err, output) {
    if (err) { throw err; }
    var filename = output.slice(-2,-1)[0].replace("[ffmpeg] Destination: ", "");
    console.log("Clipping audio");
    ffmpeg(filename)
		.setStartTime(time_start)
		.setDuration(duration)
		.output('samples/' + argv.name + '.wav')
		.on('end', function(err) {
        	if(!err) {
	            console.log('conversion done');
	            fs.unlinkSync(filename);
    	    }
    	})
		.on('error', function(err){
			console.log('error: ', err);
		}).run();
});