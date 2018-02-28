# Plotting Gershwin

Using pitch detection to graph the opening glissando in "Rhapsody in Blue"

## Setup
You'll need Node and Python 3, which you can download directly or install via Homebrew. Then install the dependencies
	
	pip install -r requirements.txt #make require sudo or `pip3` depending on your setup
	npm install

## Performances

+ [Columbia Symphony Orchestra (Leonard Bernstein)](https://www.youtube.com/watch?v=9aS20ojHDHg)
+ [Philadelphia Orchestra](https://www.youtube.com/watch?v=xWB5m3ycYg0)
+ [Royal Philharmonic Orchestra](https://www.youtube.com/watch?v=hpynmrUI4oI)
+ [Slovak National Philharmonic Orchestra](https://www.youtube.com/watch?v=ynEOo28lsbc)
+ [Lang Lang](https://www.youtube.com/watch?v=ss2GFGMu198)

## Getting the clips

The `get_audio.js` script downloads the YouTube url, extracts just the portion of the audio you specify, and deletes the downloaded videos

+ `node get_audio.js --name=columbia --url=https://www.youtube.com/watch?v=9aS20ojHDHg --start=3 --end=8`
+ `node get_audio.js --name=philadelphia --url=https://www.youtube.com/watch?v=xWB5m3ycYg0 --start=3 --end=9`
+ `node get_audio.js --name=royal --url=https://www.youtube.com/watch?v=hpynmrUI4oI --start=3 --end=8`
+ `node get_audio.js --name=slovak --url=https://www.youtube.com/watch?v=ynEOo28lsbc --start=5 --end=8`
+ `node get_audio.js --name=langlang --url=https://www.youtube.com/watch?v=ss2GFGMu198 --start=6 --end=12`

(I cleaned up each sample in Audacity to make sure it starts right at the beginning of the glissando and ends right before the rest of the orchestra joins in)

## Generating the frequencies

I would prefer to have used Node here, but the Python bindings to the [aubio toolkit](https://aubio.org/) have more sophisticated pitch detection than the leading [Node module](https://www.npmjs.com/package/node-pitchfinder), which is still working on implementing the "YIN w/ FFT" algorithm.

The Python script `Generate_Frequencies.py` detects the pitch at intervals of 1024 frames. The output is very good but inevitably contains some outliers. For example, here's the raw output for the Columbia Symphony Orchestra:

![Columbia Symphony Orchestra, Raw](./output/images/columbia_raw.png)

To correct for the noise, I wrote a simple algorithm to guess where the outliers ought to be. It's not perfect and arguably overfits some of the time, but it's reasonably consistent across the five samples:

	# first, identify all the outliers and move them closer to the correct position
	corrected = [pitches[0]]
	for i in range(1, len(pitches)-1):
	    diff = abs(pitches[i]-corrected[i-1])
	    if diff > 150:
	        corrected += [corrected[i-1]]
	    elif diff > 100:
	        average = (corrected[i-1] + pitches[i+1]) / 2
	        corrected += [average]
	    else:
	        corrected += [pitches[i]]

	# then iterate over the corrected array, gradually bringing the outliers into line
	for x in range(2,20):
	    arr = corrected
	    for i in range(1, len(arr)-1):
	        diff = abs(arr[i] - arr[i+1])
	        threshold =100 - 5 * x
	        if diff > threshold:
	            average = (arr[i-1] + arr[i+1]) / 2
	            corrected[i] = average

Here's how it fixes up the Columbia output:

![Columbia Symphony Orchestra, Smoothed](./output/images/columbia_smoothed.png)

The Python script outputs three files: Two images in the [output/images](output/images) directory that graph the algorithm's raw output and smoothed output, and a csv file in the [output/data](output/data) directory that contains the smoothed frequency for each point.

Here are the command-line scripts for all five samples. (Again, depending on your system, you may need to run `python3`)

+ python Generate_Frequencies.py --name=columbia --title="Columbia Symphony Orchestra"
+ python Generate_Frequencies.py --name=philadelphia --title="Philadelphia Orchestra"
+ python Generate_Frequencies.py --name=royal --title="Royal Philharmonic Orchestra"
+ python Generate_Frequencies.py --name=slovak --title="Slovak National Philharmonic Orchestra"
+ python Generate_Frequencies.py --name=langlang --title="Lang Lang"
