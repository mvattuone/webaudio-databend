Let's go on a (Data)bender

* Who am I? (2-3 mins)
  * About Me
  * How you can reach me
  * What do I find interesting about technology (canvas, Web Audio API)
* What is Databending (2-3 mins)
  * From ye olde Wikipedia - "Databending is the process of manipulating a media file of a certain format, using software designed to edit files of another format."
  * Inspired by circuit bending
  * An example of technology that is not prescriptive
* How did I hear about databending?
  * Saw https://github.com/robertfoss/audio_shop - thought it was cool
  * Thought it would be cool to have that on the Web
* Types of Databending (1-2 mins)
  * Reinterpretation
  * Incorrect Editing
  * Forced Errors
* Examples of Databending (1-2 mins)
  * (Some photos of databent stuff from stAllio)
* How do we databend with Javascript? (6-8 mins)
  * Bend the data
    * Take an image, draw it to the canvas, and get the image data
    * ImageData is `Uint8ClampedArray`
    * Create a single AudioBuffer containing canvas ImageData, using an AudioContext
  * Bend the Data (Bend)
    * raw binary data buffer
    * not directly editable, must be read and written to via one of the available typed arrays
    * ImageData is `Uint8ClampedArray`, and AudioBuffer.getChannelData returns a `Float32Array`
      * This is where we "bend" the data
  * Add effects to the bent image (Process)
    * Set flags to determine which effects should or should not render
    * Create one-use OfflineAudioContext with AudioBufferSourceNode containing AudioBuffer from AudioContext
    * Detune or alter playback of the source node if enabled
    * Connect enabled effects to AudioBufferSourceNode input and to destination output
    * startRendering to render the audio graph to a renderedBuffer
  * Re-render the bent image to the canvas (Render)
    * Check that something was rendered and draw the original image if not
    * With the renderedBuffer, create a new ImageData object
    * putImageData onto the canvas, profit
* Demo
  * Dat.gui modifies variables
* More Ideas (2 mins)
  * More granular databending - "draw" the effect
  * Map midi events to arbitrary audio effects, real-timeish image manipulation
  * Run videos (static + streaming) through audio effects
* Outro
  * Noguchi quote? (1 mins)
  * Thanks



The data is more or less structured the same way, so you can expect to see the transformations applied to each data format.

The analogue to an image pixel here would be an audio sample.
That is why the audioBuffer is equal to databent.canvas.width * databent.canvas.height * 4


Interchange of digital information

### Who am I

I am Mike Vattuone. I'm a web developer at Condé Nast.
Been in New York for a little under 2 years now, originally from Northern California

I'm also a musician, and I'm a big fan of trying to figure out how to make my interests align with my skills.

### What is databending?

Databending (or data bending) is the process of manipulating a media file of a certain format, using software designed to edit files of another format. Often utilized in glitch art.

### What is glitch art?

The process of harnessing errors to create certain aesthetics in media files.

### Why would you do this

Why would you make a to-do list?

It's interesting, a good "artistic" release for developers that want to do creative things on the side.

It covers interesting things in Javascript you might not cover in your day-to-day
* Canvas
* Web Audio API
* ArrayBuffers and Typed Arrays

Programming often is prescriptive - you're giving specs, rules, and documentation to follow.
  Breaking from this mold allows for unexpected and sometimes interesting results.

Shows that data, at its core, is just data, and these APIs transform _reinterpretations_ of data via higher level abstractions.
    Running processes on audio to cause certain effects requires a manipulation of binary data. That's just how computers work.
    No matter how high level your abstraction, you're inevitably transforming that data.


It's like an instrument acting on image instead of sound.

                 Trigger |------ Operating on a data buffer ------>
Image/Instrument (Input) ==> [ Pedal ] ==> [ Pedal ] ==> [ Pedal ] ==> Speaker/Canvas (Output)

### Examples of "databending" (thanks Wikipedia)

* Incorrect editing: Files of a certain format are manipulated using software designed to edit files of a different format.
* Reinterpretation: Files are simply converted from one medium to another.
* Forced errors: Known software bugs are exploited to force the program to terminate, usually while writing a file.

For the purposes of this discussion, we'll mostly be focusing on reinterpretation.

### Working with raw pixel data
It seems really daunting because you're working with arrays that have a lot of values, but there is an order to it, and it's quite simple once you understand that.

getImageData returns a Uint8ClampedArray that has ordered RGBA data as follows

[ R1, G1, B1, A1, R2, G2, B2, A2, etc... ]

Each of those clusters of RGBA represents a pixel, starting from the top left, moving left to right, and proceeding downward

"The Uint8ClampedArray contains height × width × 4 bytes of data, with index values ranging from 0 to (height×width×4)-1."

### Channel Shifting
Channel shifting is the process of taking the red, green or blue values of pixels in an image and applying those values to pixels in different positions on the image.

This creates a "ghosting effect"

### Use Cases

* Instagram-like experiences that require "filters"
* Create a song that has alterable effects, and tie those effects into a visualization.
* What about video?
* What about webcam?

### ArrayBuffer
ArrayBuffers is a raw binary data data buffer. You do not directly access ArrayBuffers - rather, you manipulate their contents
as one of many potential typed arrays.*
* You can also use a DataView.

Examples of typed arrays are Uint8ClampedArray (used with canvas data frequently), Float32Array, Int8Array, etc. These all have a buffer attribute which ultimately determines what data you see. Changing one representation of the ArrayBuffer via a typed array will cause the data in other views to change immediately.

For our purposes, we're looking solely at the Uint8ClampedArray

### What is the algorithm

We take an image and convert to raw RGB using `getImageData`, and proceed to .... do stuff.... that I will elaborate on later.
Diagram?



### Canvas


### Web Audio API

* What is it?

* OfflineAudioContext
The OfflineAudioContext interface is an AudioContext interface representing an audio-processing graph built from linked together AudioNodes. In contrast with a standard AudioContext, an OfflineAudioContext doesn't render the audio to the device hardware; instead, it generates it, as fast as it can, and outputs the result to an AudioBuffer.

### Gain
Simplest to think about - gain seems to act like contrast
High values = more contast

### Biquad
"filters" a la Instagram

### "Tuning" an image
Buffersource has a detune parameter
Attempting to "tune" your image after it has been detuned feels _very_ similar to trying to tune a guitar... it's hard to get just right.

### Speed up or slow down an image.
Playback rate is ...
When you change this, it either enlarges the image to show, say, a quarter of it (w/ a value of 0.25) or repeats the image multiple times (i.e. value = 4 means 4 times)
The images get smaller, presumably because it is sampling across the same buffer (or something like that) - I guess I just mean that it only has a finite amount of space so it has to make up for it somehow.

### Reverb

### Phaser



### API
# Instantiate a new Databend image
# Takes an image node and converts it to raw RGB binary data for use with Web Audio or whatever...
var imageToDatabend = databend(<image>);

# Enable or disable effect with default values or assign params
# Might make more sense to recreate each time since I believe OfflineNode is discarded each time.
imageToDatabend.toggle(<effect>, <params>);

# Actually render the image for use with canvas or whatever
imageToDatabend.render(); /


### Effects
* gain
* delay
* bitcrusher
* biquad (what's a better word for this?)
  * Maybe it's better to utilize (Highpass Filtering, Lowpass filtering, as individual things?)
  * Should look into how filter pedals work
* phaser
* overdrive (TODO)
* reverb (TODO)


### Future Thoughts

* Perhaps make a React Component

```
var React = require('react');
var Databender = require('databender');
var gainConfig = {
  value: 1
}


<Databender gain={gainConfig}>
  <img src="asgasggas" />
</Databender>
```

*
