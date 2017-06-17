var Databender =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bend = __webpack_require__(2);

var _bend2 = _interopRequireDefault(_bend);

var _convert = __webpack_require__(3);

var _convert2 = _interopRequireDefault(_convert);

var _draw = __webpack_require__(4);

var _draw2 = _interopRequireDefault(_draw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  bend: _bend2.default,
  convert: _convert2.default,
  draw: _draw2.default
};

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = {
	"channelShift": {
		"active": false,
		"weight": 40,
		"shiftRed": false,
		"shiftBlue": false,
		"shiftGreen": false
	},
	"bitcrusher": {
		"active": false,
		"bits": 16,
		"normfreq": 0.1,
		"bufferSize": 4096
	},
	"convolver": {
		"active": false,
		"highCut": 22050,
		"lowCut": 20,
		"dryLevel": 1,
		"wetLevel": 1,
		"level": 1,
		"impulse": "CathedralRoom.wav "
	},
	"biquad": {
		"active": false,
		"type": "highpass",
		"biquadFrequency": 4000,
		"biquadGain": 1
	},
	"gain": {
		"active": false,
		"value": 1
	},
	"detune": {
		"active": false,
		"value": 0
	},
	"playbackRate": {
		"active": false,
		"value": 1
	},
	"pingPong": {
		"active": false,
		"feedback": 0.3,
		"wetLevel": 0.5,
		"delayTimeLeft": 10,
		"delayTimeRight": 10
	},
	"phaser": {
		"active": false,
		"rate": 1.2,
		"depth": 0.4,
		"feedback": 0.5,
		"stereoPhase": 10,
		"baseModulationFrequency": 500
	},
	"wahwah": {
		"active": false,
		"automode": true,
		"baseFrequency": 0.5,
		"excursionOctaves": 2,
		"sweep": 0.2,
		"resonance": 10,
		"sensitivity": 0.5
	}
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = bend;

var _effects = __webpack_require__(1);

var _effects2 = _interopRequireDefault(_effects);

var _ = __webpack_require__(0);

var _2 = _interopRequireDefault(_);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function bend() {
  var _this = this;
  var effects = this.effects;

  // @NOTE: This has to be instantiated every time we "render" because
  // `Uncaught (in promise) DOMException: cannot startRendering when an OfflineAudioContext is closed
  var offlineAudioCtx = new OfflineAudioContext(this.channels, this.bufferSize, this.audioCtx.sampleRate);

  if (!this.effects.channelShift.active && this.channelShifted) {
    this.nowBuffering.set(this.imageData);
  }

  // Create an AudioBufferSourceNode, which represents an audio source
  // consisting of in-memory audio data
  var bufferSource = offlineAudioCtx.createBufferSource();

  // Channel shifting is moving certain color components from one pixel to another pixel
  // @NOTE pretty janky and could be better, doesn't really fit w/ this type of databending
  if (effects.channelShift.active) {
    var nowBuffering = this.audioBuffer.getChannelData(0);
    var weight = effects.channelShift.weight;
    for (var i = 0; i < this.bufferSize; i += 4) {
      if (i % (this.canvas.width / weight) === 0) {
        if (effects.channelShift.shiftRed) {
          nowBuffering[i] = 0;
        }

        if (effects.channelShift.shiftGreen) {
          nowBuffering[i + 1] = 0;
        }

        if (effects.channelShift.shiftBlue) {
          nowBuffering[i + 2] = 0;
        }
      }
    }
    this.channelShifted = true;
  }

  // Set buffer to audio buffer containing image data
  bufferSource.buffer = this.audioBuffer;

  // Seems to rotate the image, clockwise if postitive ccw if negative
  if (effects.detune.active) {
    var noEffects = false;
    bufferSource.detune.value = effects.detune.value;
  }

  // Seems to "play back" the image at a rate equal to the number
  // (i.e. 4 yields 4 smaller rendered images)
  if (effects.playbackRate.active) {
    var noEffects = false;
    bufferSource.playbackRate.value = effects.playbackRate.value;
  }

  //  @NOTE: Calling this is when the AudioBufferSourceNode becomes unusable
  bufferSource.start();

  // @TODO Can we decouple effects from this?
  var noEffects = true;
  var tuna = new Tuna(offlineAudioCtx);

  if (effects.bitcrusher.active) {
    var noEffects = false;

    var crusher = new tuna.Bitcrusher({
      bits: effects.bitcrusher.bits,
      normfreq: effects.bitcrusher.normfreq,
      bufferSize: effects.bitcrusher.bufferSize
    });
    bufferSource.connect(crusher);
    crusher.connect(offlineAudioCtx.destination);
  }

  if (effects.biquad.active) {
    var noEffects = false;
    var biquadFilter = offlineAudioCtx.createBiquadFilter();
    biquadFilter.type = effects.biquad.type;
    biquadFilter.frequency.value = effects.biquad.biquadFrequency;
    biquadFilter.gain.value = effects.biquad.biquadGain;
    bufferSource.connect(biquadFilter);
    biquadFilter.connect(offlineAudioCtx.destination);
  }

  if (effects.gain.active) {
    var noEffects = false;
    var gainNode = offlineAudioCtx.createGain();
    bufferSource.connect(gainNode);
    gainNode.gain.value = effects.gain.value;
    gainNode.connect(offlineAudioCtx.destination);
  }

  if (effects.pingPong.active) {
    var noEffects = false;

    var pingPongDelayNode = new tuna.PingPongDelay({
      wetLevel: effects.pingPong.wetLevel,
      feedback: effects.pingPong.feedback,
      delayTimeLeft: effects.pingPong.delayTimeLeft,
      delayTimeRight: effects.pingPong.delayTimeRight
    });
    bufferSource.connect(pingPongDelayNode);
    pingPongDelayNode.connect(offlineAudioCtx.destination);
  }

  if (effects.phaser.active) {
    var noEffects = false;

    tuna = new Tuna(offlineAudioCtx);
    var phaser = new tuna.Phaser({
      rate: effects.phaser.rate,
      depth: effects.phaser.depth,
      feedback: effects.phaser.feedback,
      stereoPhase: effects.phaser.stereoPhase,
      baseModulationFrequency: effects.phaser.baseModulationFrequency
    });
    bufferSource.connect(phaser);
    phaser.connect(offlineAudioCtx.destination);
  }

  if (effects.convolver.active) {
    var noEffects = false;
    var convolver = new tuna.Convolver({
      highCut: this.effects.convolver.highCut,
      lowCut: this.effects.convolver.lowCut,
      dryLevel: this.effects.convolver.dryLevel,
      wetLevel: this.effects.convolver.wetLevel,
      level: this.effects.convolver.level,
      impulse: this.effects.convolver.impulse
    });
    bufferSource.connect(convolver);
    convolver.connect(offlineAudioCtx.destination);
  }

  if (effects.wahwah.active) {
    var noEffects = false;
    var wahwah = new tuna.WahWah({
      automode: effects.wahwah.automode,
      baseFrequency: effects.wahwah.baseFrequency,
      excursionOctaves: effects.wahwah.excursionOctaves,
      sweep: effects.wahwah.sweep,
      resonance: effects.wahwah.resonance,
      sensitivity: effects.wahwah.sensitivity
    });
    bufferSource.connect(wahwah);
    wahwah.connect(offlineAudioCtx.destination);
  }

  if (noEffects) {
    bufferSource.connect(offlineAudioCtx.destination);
  }

  // Kick off the render, callback will contain rendered buffer in event
  offlineAudioCtx.startRendering();

  // Render the databent image.
  offlineAudioCtx.oncomplete = function (e) {
    // Instead of starting the bufferSource, move data back into Canvas land.
    _2.default.draw.call(_this, e.renderedBuffer);
  };
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = convert;
function convert(image) {
  // Create in-memory (i.e. non-rendered canvas for getting Image Data
  var canvas = this.canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.id = 'canvas-' + Date.now();
  var ctx = this.ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0);
  var imageData = ctx.getImageData(0, 0, image.width, image.height).data;
  return imageData;
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = draw;
function draw(buffer) {
  // Get buffer data
  var bufferData = buffer.getChannelData(0);

  // ImageData expects a Uint8ClampedArray so we need to make a typed array from our buffer
  // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
  var clampedDataArray = new Uint8ClampedArray(buffer.length);

  // set the renderedBuffer to Uint8ClampedArray to use in ImageData later
  clampedDataArray.set(bufferData);

  // putImageData requires an ImageData Object
  // @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
  var transformedImage = new ImageData(clampedDataArray, this.canvas.width, this.canvas.height);
  this.ctx.putImageData(transformedImage, 0, 0);
  document.body.prepend(this.canvas);
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _core = __webpack_require__(0);

var _core2 = _interopRequireDefault(_core);

var _effects = __webpack_require__(1);

var _effects2 = _interopRequireDefault(_effects);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Databender = function () {
  function Databender(image) {
    _classCallCheck(this, Databender);

    // Create an AudioContext
    // @TODO How to handle existing audio context??
    this.audioCtx = new AudioContext();

    // Draw image to canvas and get image data
    this.imageData = _core2.default.convert.call(this, image);

    this.effects = _effects2.default;

    // Make an audioBuffer on the audioContext to pass to the offlineAudioCtx AudioBufferSourceNode
    // @TODO Channel per color component (i.e. 3 channels)?
    this.channels = 1;
    this.bufferSize = this.imageData.length / this.channels;
    this.audioBuffer = this.audioCtx.createBuffer(this.channels, this.bufferSize, this.audioCtx.sampleRate);

    // This gives us the actual ArrayBuffer that contains the data
    this.nowBuffering = this.audioBuffer.getChannelData(0);

    // set the AudioBuffer buffer to the same as the imageData audioBuffer
    // v. convenient becuase you do not need to convert the data yourself
    this.nowBuffering.set(this.imageData);

    _core2.default.bend.call(this, this.imageData);

    return this;
  }

  _createClass(Databender, [{
    key: 'convert',
    value: function convert() {
      return _core2.default.convert.call(this);
    }
  }, {
    key: 'bend',
    value: function bend() {
      return _core2.default.bend.call(this);
    }
  }, {
    key: 'draw',
    value: function draw(buffer) {
      return _core2.default.draw.call(this);
    }
  }]);

  return Databender;
}();

exports.default = Databender;

/***/ })
/******/ ]);