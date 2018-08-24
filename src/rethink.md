okay

soooo

/webaudio-databend
--/src
----/index.js
----/audio.js
----/config.js
----/layer.js
----/databender.js
----/controller.js
----/tools
------/brush.js
------/fill.js
------/granulate.js
------/index.js
----/effects
------/biquad.js
------/bitcrusher.js
------/chorus.js
------/convolver.js
------/detune.js
------/gain.js
------/index.js
------/phaser.js
------/pingPong.js
------/playbackRate.js
------/wahwah.js

This application contains a controller and a container, as well as various static pages.

A controller is a GUI that allows for creation of layers, as well as application of effects via tools for each layer.

The container is effectively a div that will house all of the layers that we create. 

Layers are elements to which we can apply various effects via tools. Layers accept images and video. 

A databender accepts an image or video, converts said input into an audio signal and applies audio effects, re-rendering the transformed audio signal

Effects are audio effects that are applied to source data passed into a databender `bend` method.

Tools are different ways to apply the various effects. 

-- app
-- layer
-- controller
-- databender
-- effects
---- blabla...
-- tools
---- blabla...




