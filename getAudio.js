const fs = require('fs');
const youtubedl = require('youtube-dl-exec');
const argv = require('minimist')(process.argv.slice(2));

let performances = require('./performances.json');

function stringPad(n) {
	n = n.toFixed(2);
	return (n < 10 ? "0" : "") + n;
}

const downloadGlissando = function(performance) {

	// youtube-dl -f bestaudio --extract-audio --audio-quality 0 --postprocessor-args "-ss 00:00:02.00 -t 00:00:08.00" "https://www.youtube.com/watch?v=U17-ZD4K4kI" -o samples/columbia.wav && ffmpeg -i "samples/columbia.opus" "samples/columbia.wav"

	console.log(`Downloading glissando for ${ performance.name }`);

	const duration = (performance.end_time - performance.start_time);

	const postProcessor = `-ss 00:00:${ stringPad(performance.start_time) }0 -t 00:00:${ stringPad(duration) }`;

	console.log(postProcessor);

	youtubedl(performance.url, {
		extractAudio: true,
		audioFormat: 'wav',
		output: `samples/${ performance.filename }.opus`,
		postprocessorArgs: postProcessor,
	}).then(function(output) {
	    console.log(output);
	});
}

if (argv && argv.name) {
	argv.names = argv.name;
}

if (argv.names) {
	argv.names = argv.names.split(",");
	performances = performances.filter(d => {
		return argv.names.indexOf(d.filename) != -1;
	});
}

console.log("Getting samples for", performances.map(d => d.filename).join(","));

performances.forEach(p => {
	downloadGlissando(p);	
});


