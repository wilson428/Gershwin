var orchestras = {
	columbia: "Columbia Symphony Orchestra",
	philadelphia: "Philadelphia Orchestra",
	royal: "Royal Philharmonic Orchestra",
	slovak: "Slovak Philharmonic Orchestra",
	london: "London Symphony Orchestra"
};

var urls = {
	columbia: "https://www.youtube.com/watch?v=9aS20ojHDHg",
	philadelphia: "https://www.youtube.com/watch?v=xWB5m3ycYg0",
	royal: "https://www.youtube.com/watch?v=hpynmrUI4oI",
	slovak: "https://www.youtube.com/watch?v=ynEOo28lsbc",
	london: "https://www.youtube.com/watch?v=ss2GFGMu198"
};

var notes = {
	174.61: "F",
	233.08: "B♭",
	349.23: "F",
	466.16: "B♭",
	698.46: "F",
	932.33: "B♭"
}

function loadSound(path) {
	// audio supported?
	if (typeof window.Audio === 'function') {
		var audioElem = new Audio();
		audioElem.preload = "metadata";
		audioElem.src = path;
		return audioElem;
	} else {
		d3.select("#console").html("Sorry, this browser does not support HTML5 audio.");
	}
}

var samples = Object.keys(data);
var sounds = {};

var AUDIO_LOADED = 0;

var xmax = 0,
	ymax = 0,
	dot,
	xScale,
	yScale,
	g,
	PLAYING = false;

samples.forEach(d => {
	sounds[d] = {
		audio: loadSound("./samples/" + d + ".wav")
	};

	sounds[d].audio.addEventListener('loadedmetadata', function(e) { 
		sounds[d].key = d;
		sounds[d].name = orchestras[d];
		sounds[d].url = urls[d];
		sounds[d].duration = this.duration;
		sounds[d].rate = this.duration / data[d].length;
		sounds[d].data = data[d].map(function(dd, ii) {
			return {
				x: sounds[d].rate * ii,
				y: dd
			};
		});
		xmax = Math.max(xmax, sounds[d].duration);
		ymax = Math.max(ymax, sounds[d].data.slice(-1)[0].y);
		AUDIO_LOADED += 1;

		if (AUDIO_LOADED == 5) {
			init();
		}
	}, false);

	sounds[d].audio.addEventListener("playing", function() {
		var index = 0;
		var timer = setInterval(function() {
			if (index >= sounds[d].data.length) {
				clearTimeout(timer);
				g.selectAll(".sample").style("opacity", 1);
				PLAYING = false;
				return;
			}
			dot.attr("cx", xScale(sounds[d].data[index].x)).attr("cy", yScale(sounds[d].data[index].y));
			index += 1;
		}, sounds[d].rate * 1000);

	}, false);
});


function init() {
	var width = 600,
		height = 500;

	// This makes SVGs responsive to page size
	// https://github.com/TimeMagazine/elastic-svg
	var base = elasticSVG("#svg_container", {
		width: width,
		aspect: height / width,
		resize: "auto"
	});

	var margin = { top: 20, right: 10, bottom: 30, left: 40 };

	var chart_width = width - (margin.left + margin.right);
	var chart_height = height - (margin.top + margin.bottom);

	var svg = d3.select(base.svg);

	// var colors = ["rgb(228, 26, 28)", "rgb(55, 126, 184)", "rgb(77, 175, 74)", "rgb(152, 78, 163)", "rgb(255, 127, 0)"];
	var colors = ["#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"];

	xScale = d3.scaleLinear().domain([0, xmax]).range([0, chart_width]);
	var xAxis = d3.axisBottom(xScale);

	yScale = d3.scaleLog().domain([174.61, 932.33]).range([chart_height, 0]);
	var yAxis = d3.axisLeft(yScale);

	xAxis.tickValues([1,2,3]);
	xAxis.tickFormat(function(d) {
		return parseInt(d) + " sec";
	});
	xAxis.tickSize(-chart_height, 0);

	yAxis.tickValues(Object.keys(notes));
	yAxis.tickFormat(function(d) {
		return notes[d];
	});
	yAxis.tickSize(-chart_width, 0);

	var line = d3.line()
		.x(function(d) { return xScale(d.x); })
		.y(function(d) { return yScale(d.y); });

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(" + margin.left + "," + (chart_height + margin.top) + ")")
		.call(xAxis);

	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")		
		.call(yAxis);

	g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.bottom + ")")

	g.selectAll(".sample")
		.data(d3.values(sounds))
		.enter()
		.append("path")
		.attr("id", function(d) {
			return d.key;
		})
		.attr("class", "sample")
		.attr("d", function(d) {
			return line(d.data);
		})
		.style("stroke", function(d, i) {
			return colors[i];
		})
		.on("click", function(d) {
			playSound(d);
		});

	dot = g.append("circle")
		.attr("cx", -1000)
		.attr("cy", -1000)
		.attr("r", 10)
		.attr("class", "play_dot");

	d3.select("#legend").selectAll(".orchestra")
		.data(d3.values(sounds))
		.enter()
		.append("div")
		.attr("class", "orchestra")
		.html(function(d) {
			return d.name + "<a href='" + d.url + "' target='_blank'>&#128279;</a>";
		})
		.style("border-left", function(d, i) {
			return "20px solid " + colors[i];
		})
		.on("click", function(d) {
			if (d3.event.target.tagName.toLowerCase() === "a") {
				return;
			}			
			playSound(d);
		});

	function playSound(d) {
		if (PLAYING) {
			console.log("Already playing");
			return;
		}
		PLAYING = true;
		g.selectAll(".sample").style("opacity", 0.25);
		g.select("#" + d.key).style("opacity", 1);

		d.audio.play();
	}
}