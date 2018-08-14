var webaudioDatabend = (function () {
  'use strict';

  const options = {
    playAudio: false,
    frameRate: 30
  };

  const tools = {
    Brush: {
      active: false,
      size: 48
    },
    Fill: {
      active: false
    }
  };

  const effects = {
    bitcrusher: {
      active: false,
      bits: 4,
      normfreq: 0.1,
      bufferSize: 256
    },
    convolver: {
      active: false,
      highCut: 22050,
      lowCut: 20,
      dryLevel: 1,
      wetLevel: 1,
      level: 1,
      impulse: "CathedralRoom.wav" 
    },
    chorus: {
      active: false,
      feedback: 0.4,
      delay: 0.0045,
      depth: 0.7,
      rate: 1.5,
      bypass: 0
    },
    biquad: {
      active: false,
      areaOfEffect: 1,
      detune: 0,
      enablePartial: false,
      randomize: false,
      quality: 1,
      randomValues: 2,
      type: "highpass",
      biquadFrequency: 4000
    },
    gain: {
      active: false,
      value: 1
    },
    detune: {
      active: false,
      areaOfEffect: 1,
      enablePartial: false,
      randomize: false,
      randomValues: 2,
      value: 0
    },
    playbackRate: {
      active: false,
      areaOfEffect: 1,
      enablePartial: false,
      randomize: false,
      randomValues: 2,
      value: 1
    },
    pingPong: {
      active: false,
      feedback: 0.3,
      wetLevel: 0.5,
      delayTimeLeft: 10,
      delayTimeRight: 10
    },
    phaser: {
      active: false,
      rate: 1.2,
      depth: 0.4,
      feedback: 0.5,
      stereoPhase: 10,
      baseModulationFrequency: 500
    },
    wahwah: {
      active: false,
      automode: true,
      baseFrequency: 0.5,
      excursionOctaves: 2,
      sweep: 0.2,
      resonance: 10,
      sensitivity: 0.5
    }
  };

  var config = {
    options,
    tools,
    effects
  };

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function commonjsRequire () {
  	throw new Error('Dynamic requires are not currently supported by rollup-plugin-commonjs');
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var tuna = createCommonjsModule(function (module) {
  /*
      Copyright (c) 2012 DinahMoe AB & Oskar Eriksson

      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
      files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
      modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software
      is furnished to do so, subject to the following conditions:

      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
      DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE
      OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */
  /*global module*/
  (function() {

      var userContext,
          userInstance,
          pipe = function(param, val) {
              param.value = val;
          },
          Super = Object.create(null, {
              activate: {
                  writable: true,
                  value: function(doActivate) {
                      if (doActivate) {
                          this.input.disconnect();
                          this.input.connect(this.activateNode);
                          if (this.activateCallback) {
                              this.activateCallback(doActivate);
                          }
                      } else {
                          this.input.disconnect();
                          this.input.connect(this.output);
                      }
                  }
              },
              bypass: {
                  get: function() {
                      return this._bypass;
                  },
                  set: function(value) {
                      if (this._lastBypassValue === value) {
                          return;
                      }
                      this._bypass = value;
                      this.activate(!value);
                      this._lastBypassValue = value;
                  }
              },
              connect: {
                  value: function(target) {
                      this.output.connect(target);
                  }
              },
              disconnect: {
                  value: function(target) {
                      this.output.disconnect(target);
                  }
              },
              connectInOrder: {
                  value: function(nodeArray) {
                      var i = nodeArray.length - 1;
                      while (i--) {
                          if (!nodeArray[i].connect) {
                              return console.error("AudioNode.connectInOrder: TypeError: Not an AudioNode.", nodeArray[i]);
                          }
                          if (nodeArray[i + 1].input) {
                              nodeArray[i].connect(nodeArray[i + 1].input);
                          } else {
                              nodeArray[i].connect(nodeArray[i + 1]);
                          }
                      }
                  }
              },
              getDefaults: {
                  value: function() {
                      var result = {};
                      for (var key in this.defaults) {
                          result[key] = this.defaults[key].value;
                      }
                      return result;
                  }
              },
              automate: {
                  value: function(property, value, duration, startTime) {
                      var start = startTime ? ~~(startTime / 1000) : userContext.currentTime,
                          dur = duration ? ~~(duration / 1000) : 0,
                          _is = this.defaults[property],
                          param = this[property],
                          method;

                      if (param) {
                          if (_is.automatable) {
                              if (!duration) {
                                  method = "setValueAtTime";
                              } else {
                                  method = "linearRampToValueAtTime";
                                  param.cancelScheduledValues(start);
                                  param.setValueAtTime(param.value, start);
                              }
                              param[method](value, dur + start);
                          } else {
                              param = value;
                          }
                      } else {
                          console.error("Invalid Property for " + this.name);
                      }
                  }
              }
          }),
          FLOAT = "float",
          BOOLEAN = "boolean",
          STRING = "string",
          INT = "int";

      if (module.exports) {
          module.exports = Tuna;
      } else if (typeof undefined === "function") {
          window.define("Tuna", definition);
      } else {
          window.Tuna = Tuna;
      }

      function definition() {
          return Tuna;
      }

      function Tuna(context) {
          if (!(this instanceof Tuna)) {
              return new Tuna(context);
          }

          var _window = typeof window === "undefined" ? {} : window;

          if (!_window.AudioContext) {
              _window.AudioContext = _window.webkitAudioContext;
          }
          if (!context) {
              console.log("tuna.js: Missing audio context! Creating a new context for you.");
              context = _window.AudioContext && (new _window.AudioContext());
          }
          if (!context) {
              throw new Error("Tuna cannot initialize because this environment does not support web audio.");
          }
          connectify(context);
          userContext = context;
          userInstance = this;
      }

      function connectify(context) {
          if (context.__connectified__ === true) return;

          var gain = context.createGain(),
              proto = Object.getPrototypeOf(Object.getPrototypeOf(gain)),
              oconnect = proto.connect;

          proto.connect = shimConnect;
          context.__connectified__ = true; // Prevent overriding connect more than once

          function shimConnect() {
              var node = arguments[0];
              arguments[0] = Super.isPrototypeOf ? (Super.isPrototypeOf(node) ? node.input : node) : (node.input || node);
              oconnect.apply(this, arguments);
              return node;
          }
      }

      function dbToWAVolume(db) {
          return Math.max(0, Math.round(100 * Math.pow(2, db / 6)) / 100);
      }

      function fmod(x, y) {
          // http://kevin.vanzonneveld.net
          // *     example 1: fmod(5.7, 1.3);
          // *     returns 1: 0.5
          var tmp, tmp2, p = 0,
              pY = 0,
              l = 0.0,
              l2 = 0.0;

          tmp = x.toExponential().match(/^.\.?(.*)e(.+)$/);
          p = parseInt(tmp[2], 10) - (tmp[1] + "").length;
          tmp = y.toExponential().match(/^.\.?(.*)e(.+)$/);
          pY = parseInt(tmp[2], 10) - (tmp[1] + "").length;

          if (pY > p) {
              p = pY;
          }

          tmp2 = (x % y);

          if (p < -100 || p > 20) {
              // toFixed will give an out of bound error so we fix it like this:
              l = Math.round(Math.log(tmp2) / Math.log(10));
              l2 = Math.pow(10, l);

              return (tmp2 / l2).toFixed(l - p) * l2;
          } else {
              return parseFloat(tmp2.toFixed(-p));
          }
      }

      function sign(x) {
          if (x === 0) {
              return 1;
          } else {
              return Math.abs(x) / x;
          }
      }

      function tanh(n) {
          return (Math.exp(n) - Math.exp(-n)) / (Math.exp(n) + Math.exp(-n));
      }

      function initValue(userVal, defaultVal) {
          return userVal === undefined ? defaultVal : userVal;
      }

      Tuna.prototype.Bitcrusher = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.bufferSize = properties.bufferSize || this.defaults.bufferSize.value;

          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.processor = userContext.createScriptProcessor(this.bufferSize, 1, 1);
          this.output = userContext.createGain();

          this.activateNode.connect(this.processor);
          this.processor.connect(this.output);

          var phaser = 0,
              last = 0,
              input, output, step, i, length;
          this.processor.onaudioprocess = function(e) {
              input = e.inputBuffer.getChannelData(0),
              output = e.outputBuffer.getChannelData(0),
              step = Math.pow(1 / 2, this.bits);
              length = input.length;
              for (i = 0; i < length; i++) {
                  phaser += this.normfreq;
                  if (phaser >= 1.0) {
                      phaser -= 1.0;
                      last = step * Math.floor(input[i] / step + 0.5);
                  }
                  output[i] = last;
              }
          };

          this.bits = properties.bits || this.defaults.bits.value;
          this.normfreq = initValue(properties.normfreq, this.defaults.normfreq.value);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Bitcrusher.prototype = Object.create(Super, {
          name: {
              value: "Bitcrusher"
          },
          defaults: {
              writable: true,
              value: {
                  bits: {
                      value: 4,
                      min: 1,
                      max: 16,
                      automatable: false,
                      type: INT
                  },
                  bufferSize: {
                      value: 4096,
                      min: 256,
                      max: 16384,
                      automatable: false,
                      type: INT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  },
                  normfreq: {
                      value: 0.1,
                      min: 0.0001,
                      max: 1.0,
                      automatable: false,
                      type: FLOAT
                  }
              }
          },
          bits: {
              enumerable: true,
              get: function() {
                  return this.processor.bits;
              },
              set: function(value) {
                  this.processor.bits = value;
              }
          },
          normfreq: {
              enumerable: true,
              get: function() {
                  return this.processor.normfreq;
              },
              set: function(value) {
                  this.processor.normfreq = value;
              }
          }
      });

      Tuna.prototype.Cabinet = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.convolver = this.newConvolver(properties.impulsePath || "../impulses/impulse_guitar.wav");
          this.makeupNode = userContext.createGain();
          this.output = userContext.createGain();

          this.activateNode.connect(this.convolver.input);
          this.convolver.output.connect(this.makeupNode);
          this.makeupNode.connect(this.output);

          this.makeupGain = initValue(properties.makeupGain, this.defaults.makeupGain.value);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Cabinet.prototype = Object.create(Super, {
          name: {
              value: "Cabinet"
          },
          defaults: {
              writable: true,
              value: {
                  makeupGain: {
                      value: 1,
                      min: 0,
                      max: 20,
                      automatable: true,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          makeupGain: {
              enumerable: true,
              get: function() {
                  return this.makeupNode.gain;
              },
              set: function(value) {
                  this.makeupNode.gain.value = value;
              }
          },
          newConvolver: {
              value: function(impulsePath) {
                  return new userInstance.Convolver({
                      impulse: impulsePath,
                      dryLevel: 0,
                      wetLevel: 1
                  });
              }
          }
      });

      Tuna.prototype.Chorus = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.attenuator = this.activateNode = userContext.createGain();
          this.splitter = userContext.createChannelSplitter(2);
          this.delayL = userContext.createDelay();
          this.delayR = userContext.createDelay();
          this.feedbackGainNodeLR = userContext.createGain();
          this.feedbackGainNodeRL = userContext.createGain();
          this.merger = userContext.createChannelMerger(2);
          this.output = userContext.createGain();

          this.lfoL = new userInstance.LFO({
              target: this.delayL.delayTime,
              callback: pipe
          });
          this.lfoR = new userInstance.LFO({
              target: this.delayR.delayTime,
              callback: pipe
          });

          this.input.connect(this.attenuator);
          this.attenuator.connect(this.output);
          this.attenuator.connect(this.splitter);
          this.splitter.connect(this.delayL, 0);
          this.splitter.connect(this.delayR, 1);
          this.delayL.connect(this.feedbackGainNodeLR);
          this.delayR.connect(this.feedbackGainNodeRL);
          this.feedbackGainNodeLR.connect(this.delayR);
          this.feedbackGainNodeRL.connect(this.delayL);
          this.delayL.connect(this.merger, 0, 0);
          this.delayR.connect(this.merger, 0, 1);
          this.merger.connect(this.output);

          this.feedback = initValue(properties.feedback, this.defaults.feedback.value);
          this.rate = initValue(properties.rate, this.defaults.rate.value);
          this.delay = initValue(properties.delay, this.defaults.delay.value);
          this.depth = initValue(properties.depth, this.defaults.depth.value);
          this.lfoR.phase = Math.PI / 2;
          this.attenuator.gain.value = 0.6934; // 1 / (10 ^ (((20 * log10(3)) / 3) / 20))
          this.lfoL.activate(true);
          this.lfoR.activate(true);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Chorus.prototype = Object.create(Super, {
          name: {
              value: "Chorus"
          },
          defaults: {
              writable: true,
              value: {
                  feedback: {
                      value: 0.4,
                      min: 0,
                      max: 0.95,
                      automatable: false,
                      type: FLOAT
                  },
                  delay: {
                      value: 0.0045,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  depth: {
                      value: 0.7,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  rate: {
                      value: 1.5,
                      min: 0,
                      max: 8,
                      automatable: false,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          delay: {
              enumerable: true,
              get: function() {
                  return this._delay;
              },
              set: function(value) {
                  this._delay = 0.0002 * (Math.pow(10, value) * 2);
                  this.lfoL.offset = this._delay;
                  this.lfoR.offset = this._delay;
                  this._depth = this._depth;
              }
          },
          depth: {
              enumerable: true,
              get: function() {
                  return this._depth;
              },
              set: function(value) {
                  this._depth = value;
                  this.lfoL.oscillation = this._depth * this._delay;
                  this.lfoR.oscillation = this._depth * this._delay;
              }
          },
          feedback: {
              enumerable: true,
              get: function() {
                  return this._feedback;
              },
              set: function(value) {
                  this._feedback = value;
                  this.feedbackGainNodeLR.gain.value = this._feedback;
                  this.feedbackGainNodeRL.gain.value = this._feedback;
              }
          },
          rate: {
              enumerable: true,
              get: function() {
                  return this._rate;
              },
              set: function(value) {
                  this._rate = value;
                  this.lfoL.frequency = this._rate;
                  this.lfoR.frequency = this._rate;
              }
          }
      });

      Tuna.prototype.Compressor = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.compNode = this.activateNode = userContext.createDynamicsCompressor();
          this.makeupNode = userContext.createGain();
          this.output = userContext.createGain();

          this.compNode.connect(this.makeupNode);
          this.makeupNode.connect(this.output);

          this.automakeup = initValue(properties.automakeup, this.defaults.automakeup.value);
          this.makeupGain = initValue(properties.makeupGain, this.defaults.makeupGain.value);
          this.threshold = initValue(properties.threshold, this.defaults.threshold.value);
          this.release = initValue(properties.release, this.defaults.release.value);
          this.attack = initValue(properties.attack, this.defaults.attack.value);
          this.ratio = properties.ratio || this.defaults.ratio.value;
          this.knee = initValue(properties.knee, this.defaults.knee.value);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Compressor.prototype = Object.create(Super, {
          name: {
              value: "Compressor"
          },
          defaults: {
              writable: true,
              value: {
                  threshold: {
                      value: -20,
                      min: -60,
                      max: 0,
                      automatable: true,
                      type: FLOAT
                  },
                  release: {
                      value: 250,
                      min: 10,
                      max: 2000,
                      automatable: true,
                      type: FLOAT
                  },
                  makeupGain: {
                      value: 1,
                      min: 1,
                      max: 100,
                      automatable: true,
                      type: FLOAT
                  },
                  attack: {
                      value: 1,
                      min: 0,
                      max: 1000,
                      automatable: true,
                      type: FLOAT
                  },
                  ratio: {
                      value: 4,
                      min: 1,
                      max: 50,
                      automatable: true,
                      type: FLOAT
                  },
                  knee: {
                      value: 5,
                      min: 0,
                      max: 40,
                      automatable: true,
                      type: FLOAT
                  },
                  automakeup: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          computeMakeup: {
              value: function() {
                  var magicCoefficient = 4, // raise me if the output is too hot
                      c = this.compNode;
                  return -(c.threshold.value - c.threshold.value / c.ratio.value) / magicCoefficient;
              }
          },
          automakeup: {
              enumerable: true,
              get: function() {
                  return this._automakeup;
              },
              set: function(value) {
                  this._automakeup = value;
                  if (this._automakeup) this.makeupGain = this.computeMakeup();
              }
          },
          threshold: {
              enumerable: true,
              get: function() {
                  return this.compNode.threshold;
              },
              set: function(value) {
                  this.compNode.threshold.value = value;
                  if (this._automakeup) this.makeupGain = this.computeMakeup();
              }
          },
          ratio: {
              enumerable: true,
              get: function() {
                  return this.compNode.ratio;
              },
              set: function(value) {
                  this.compNode.ratio.value = value;
                  if (this._automakeup) this.makeupGain = this.computeMakeup();
              }
          },
          knee: {
              enumerable: true,
              get: function() {
                  return this.compNode.knee;
              },
              set: function(value) {
                  this.compNode.knee.value = value;
                  if (this._automakeup) this.makeupGain = this.computeMakeup();
              }
          },
          attack: {
              enumerable: true,
              get: function() {
                  return this.compNode.attack;
              },
              set: function(value) {
                  this.compNode.attack.value = value / 1000;
              }
          },
          release: {
              enumerable: true,
              get: function() {
                  return this.compNode.release;
              },
              set: function(value) {
                  this.compNode.release.value = value / 1000;
              }
          },
          makeupGain: {
              enumerable: true,
              get: function() {
                  return this.makeupNode.gain;
              },
              set: function(value) {
                  this.makeupNode.gain.value = dbToWAVolume(value);
              }
          }
      });

      Tuna.prototype.Convolver = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.convolver = userContext.createConvolver();
          this.dry = userContext.createGain();
          this.filterLow = userContext.createBiquadFilter();
          this.filterHigh = userContext.createBiquadFilter();
          this.wet = userContext.createGain();
          this.output = userContext.createGain();

          this.activateNode.connect(this.filterLow);
          this.activateNode.connect(this.dry);
          this.filterLow.connect(this.filterHigh);
          this.filterHigh.connect(this.convolver);
          this.convolver.connect(this.wet);
          this.wet.connect(this.output);
          this.dry.connect(this.output);

          this.dryLevel = initValue(properties.dryLevel, this.defaults.dryLevel.value);
          this.wetLevel = initValue(properties.wetLevel, this.defaults.wetLevel.value);
          this.highCut = properties.highCut || this.defaults.highCut.value;
          this.buffer = properties.impulse || "../impulses/ir_rev_short.wav";
          this.lowCut = properties.lowCut || this.defaults.lowCut.value;
          this.level = initValue(properties.level, this.defaults.level.value);
          this.filterHigh.type = "lowpass";
          this.filterLow.type = "highpass";
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Convolver.prototype = Object.create(Super, {
          name: {
              value: "Convolver"
          },
          defaults: {
              writable: true,
              value: {
                  highCut: {
                      value: 22050,
                      min: 20,
                      max: 22050,
                      automatable: true,
                      type: FLOAT
                  },
                  lowCut: {
                      value: 20,
                      min: 20,
                      max: 22050,
                      automatable: true,
                      type: FLOAT
                  },
                  dryLevel: {
                      value: 1,
                      min: 0,
                      max: 1,
                      automatable: true,
                      type: FLOAT
                  },
                  wetLevel: {
                      value: 1,
                      min: 0,
                      max: 1,
                      automatable: true,
                      type: FLOAT
                  },
                  level: {
                      value: 1,
                      min: 0,
                      max: 1,
                      automatable: true,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          lowCut: {
              get: function() {
                  return this.filterLow.frequency;
              },
              set: function(value) {
                  this.filterLow.frequency.value = value;
              }
          },
          highCut: {
              get: function() {
                  return this.filterHigh.frequency;
              },
              set: function(value) {
                  this.filterHigh.frequency.value = value;
              }
          },
          level: {
              get: function() {
                  return this.output.gain;
              },
              set: function(value) {
                  this.output.gain.value = value;
              }
          },
          dryLevel: {
              get: function() {
                  return this.dry.gain;
              },
              set: function(value) {
                  this.dry.gain.value = value;
              }
          },
          wetLevel: {
              get: function() {
                  return this.wet.gain;
              },
              set: function(value) {
                  this.wet.gain.value = value;
              }
          },
          buffer: {
              enumerable: false,
              get: function() {
                  return this.convolver.buffer;
              },
              set: function(impulse) {
                  var convolver = this.convolver,
                      xhr = new XMLHttpRequest();
                  if (!impulse) {
                      console.log("Tuna.Convolver.setBuffer: Missing impulse path!");
                      return;
                  }
                  xhr.open("GET", impulse, true);
                  xhr.responseType = "arraybuffer";
                  xhr.onreadystatechange = function() {
                      if (xhr.readyState === 4) {
                          if (xhr.status < 300 && xhr.status > 199 || xhr.status === 302) {
                              userContext.decodeAudioData(xhr.response, function(buffer) {
                                  convolver.buffer = buffer;
                              }, function(e) {
                                  if (e) console.log("Tuna.Convolver.setBuffer: Error decoding data" + e);
                              });
                          }
                      }
                  };
                  xhr.send(null);
              }
          }
      });

      Tuna.prototype.Delay = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.dry = userContext.createGain();
          this.wet = userContext.createGain();
          this.filter = userContext.createBiquadFilter();
          this.delay = userContext.createDelay(10);
          this.feedbackNode = userContext.createGain();
          this.output = userContext.createGain();

          this.activateNode.connect(this.delay);
          this.activateNode.connect(this.dry);
          this.delay.connect(this.filter);
          this.filter.connect(this.feedbackNode);
          this.feedbackNode.connect(this.delay);
          this.feedbackNode.connect(this.wet);
          this.wet.connect(this.output);
          this.dry.connect(this.output);

          this.delayTime = properties.delayTime || this.defaults.delayTime.value;
          this.feedback = initValue(properties.feedback, this.defaults.feedback.value);
          this.wetLevel = initValue(properties.wetLevel, this.defaults.wetLevel.value);
          this.dryLevel = initValue(properties.dryLevel, this.defaults.dryLevel.value);
          this.cutoff = properties.cutoff || this.defaults.cutoff.value;
          this.filter.type = "lowpass";
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Delay.prototype = Object.create(Super, {
          name: {
              value: "Delay"
          },
          defaults: {
              writable: true,
              value: {
                  delayTime: {
                      value: 100,
                      min: 20,
                      max: 1000,
                      automatable: false,
                      type: FLOAT
                  },
                  feedback: {
                      value: 0.45,
                      min: 0,
                      max: 0.9,
                      automatable: true,
                      type: FLOAT
                  },
                  cutoff: {
                      value: 20000,
                      min: 20,
                      max: 20000,
                      automatable: true,
                      type: FLOAT
                  },
                  wetLevel: {
                      value: 0.5,
                      min: 0,
                      max: 1,
                      automatable: true,
                      type: FLOAT
                  },
                  dryLevel: {
                      value: 1,
                      min: 0,
                      max: 1,
                      automatable: true,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          delayTime: {
              enumerable: true,
              get: function() {
                  return this.delay.delayTime;
              },
              set: function(value) {
                  this.delay.delayTime.value = value / 1000;
              }
          },
          wetLevel: {
              enumerable: true,
              get: function() {
                  return this.wet.gain;
              },
              set: function(value) {
                  this.wet.gain.value = value;
              }
          },
          dryLevel: {
              enumerable: true,
              get: function() {
                  return this.dry.gain;
              },
              set: function(value) {
                  this.dry.gain.value = value;
              }
          },
          feedback: {
              enumerable: true,
              get: function() {
                  return this.feedbackNode.gain;
              },
              set: function(value) {
                  this.feedbackNode.gain.value = value;
              }
          },
          cutoff: {
              enumerable: true,
              get: function() {
                  return this.filter.frequency;
              },
              set: function(value) {
                  this.filter.frequency.value = value;
              }
          }
      });

      Tuna.prototype.Filter = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.filter = userContext.createBiquadFilter();
          this.output = userContext.createGain();

          this.activateNode.connect(this.filter);
          this.filter.connect(this.output);

          this.frequency = properties.frequency || this.defaults.frequency.value;
          this.Q = properties.resonance || this.defaults.Q.value;
          this.filterType = initValue(properties.filterType, this.defaults.filterType.value);
          this.gain = initValue(properties.gain, this.defaults.gain.value);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Filter.prototype = Object.create(Super, {
          name: {
              value: "Filter"
          },
          defaults: {
              writable: true,
              value: {
                  frequency: {
                      value: 800,
                      min: 20,
                      max: 22050,
                      automatable: true,
                      type: FLOAT
                  },
                  Q: {
                      value: 1,
                      min: 0.001,
                      max: 100,
                      automatable: true,
                      type: FLOAT
                  },
                  gain: {
                      value: 0,
                      min: -40,
                      max: 40,
                      automatable: true,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  },
                  filterType: {
                      value: "lowpass",
                      automatable: false,
                      type: STRING
                  }
              }
          },
          filterType: {
              enumerable: true,
              get: function() {
                  return this.filter.type;
              },
              set: function(value) {
                  this.filter.type = value;
              }
          },
          Q: {
              enumerable: true,
              get: function() {
                  return this.filter.Q;
              },
              set: function(value) {
                  this.filter.Q.setTargetAtTime(value, 0, 0);
              }
          },
          gain: {
              enumerable: true,
              get: function() {
                  return this.filter.gain;
              },
              set: function(value) {
                  this.filter.gain.value = value;
              }
          },
          frequency: {
              enumerable: true,
              get: function() {
                  return this.filter.frequency;
              },
              set: function(value) {
                  this.filter.frequency.value = value;
              }
          }
      });

      Tuna.prototype.Gain = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }

          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.gainNode = userContext.createGain();
          this.output = userContext.createGain();

          this.activateNode.connect(this.gainNode);
          this.gainNode.connect(this.output);

          this.gain = initValue(properties.gain, this.defaults.gain.value);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Gain.prototype = Object.create(Super, {
          name: {
              value: "Gain"
          },
          defaults: {
              writable: true,
              value: {
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  },
                  gain: {
                      value: 1.0,
                      automatable: true,
                      type: FLOAT
                  }
              }
          },
          gain: {
              enumerable: true,
              get: function() {
                  return this.gainNode.gain;
              },
              set: function(value) {
                  this.gainNode.gain.value = value;
              }
          }
      });

      Tuna.prototype.MoogFilter = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.bufferSize = properties.bufferSize || this.defaults.bufferSize.value;

          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.processor = userContext.createScriptProcessor(this.bufferSize, 1, 1);
          this.output = userContext.createGain();

          this.activateNode.connect(this.processor);
          this.processor.connect(this.output);

          var in1, in2, in3, in4, out1, out2, out3, out4;
          in1 = in2 = in3 = in4 = out1 = out2 = out3 = out4 = 0.0;
          var input, output, f, fb, i, length, inputFactor;
          this.processor.onaudioprocess = function(e) {
              input = e.inputBuffer.getChannelData(0),
                  output = e.outputBuffer.getChannelData(0),
                  f = this.cutoff * 1.16,
                  inputFactor = 0.35013 * (f * f) * (f * f);
              fb = this.resonance * (1.0 - 0.15 * f * f);
              length = input.length;
              for (i = 0; i < length; i++) {
                  input[i] -= out4 * fb;
                  input[i] *= inputFactor;
                  out1 = input[i] + 0.3 * in1 + (1 - f) * out1; // Pole 1
                  in1 = input[i];
                  out2 = out1 + 0.3 * in2 + (1 - f) * out2; // Pole 2
                  in2 = out1;
                  out3 = out2 + 0.3 * in3 + (1 - f) * out3; // Pole 3
                  in3 = out2;
                  out4 = out3 + 0.3 * in4 + (1 - f) * out4; // Pole 4
                  in4 = out3;
                  output[i] = out4;
              }
          };

          this.cutoff = initValue(properties.cutoff, this.defaults.cutoff.value);
          this.resonance = initValue(properties.resonance, this.defaults.resonance.value);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.MoogFilter.prototype = Object.create(Super, {
          name: {
              value: "MoogFilter"
          },
          defaults: {
              writable: true,
              value: {
                  bufferSize: {
                      value: 4096,
                      min: 256,
                      max: 16384,
                      automatable: false,
                      type: INT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  },
                  cutoff: {
                      value: 0.065,
                      min: 0.0001,
                      max: 1.0,
                      automatable: false,
                      type: FLOAT
                  },
                  resonance: {
                      value: 3.5,
                      min: 0.0,
                      max: 4.0,
                      automatable: false,
                      type: FLOAT
                  }
              }
          },
          cutoff: {
              enumerable: true,
              get: function() {
                  return this.processor.cutoff;
              },
              set: function(value) {
                  this.processor.cutoff = value;
              }
          },
          resonance: {
              enumerable: true,
              get: function() {
                  return this.processor.resonance;
              },
              set: function(value) {
                  this.processor.resonance = value;
              }
          }
      });

      Tuna.prototype.Overdrive = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.inputDrive = userContext.createGain();
          this.waveshaper = userContext.createWaveShaper();
          this.outputDrive = userContext.createGain();
          this.output = userContext.createGain();

          this.activateNode.connect(this.inputDrive);
          this.inputDrive.connect(this.waveshaper);
          this.waveshaper.connect(this.outputDrive);
          this.outputDrive.connect(this.output);

          this.ws_table = new Float32Array(this.k_nSamples);
          this.drive = initValue(properties.drive, this.defaults.drive.value);
          this.outputGain = initValue(properties.outputGain, this.defaults.outputGain.value);
          this.curveAmount = initValue(properties.curveAmount, this.defaults.curveAmount.value);
          this.algorithmIndex = initValue(properties.algorithmIndex, this.defaults.algorithmIndex.value);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Overdrive.prototype = Object.create(Super, {
          name: {
              value: "Overdrive"
          },
          defaults: {
              writable: true,
              value: {
                  drive: {
                      value: 1,
                      min: 0,
                      max: 1,
                      automatable: true,
                      type: FLOAT,
                      scaled: true
                  },
                  outputGain: {
                      value: 1,
                      min: 0,
                      max: 1,
                      automatable: true,
                      type: FLOAT,
                      scaled: true
                  },
                  curveAmount: {
                      value: 0.725,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  algorithmIndex: {
                      value: 0,
                      min: 0,
                      max: 5,
                      automatable: false,
                      type: INT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          k_nSamples: {
              value: 8192
          },
          drive: {
              get: function() {
                  return this.inputDrive.gain;
              },
              set: function(value) {
                  this._drive = value;
              }
          },
          curveAmount: {
              get: function() {
                  return this._curveAmount;
              },
              set: function(value) {
                  this._curveAmount = value;
                  if (this._algorithmIndex === undefined) {
                      this._algorithmIndex = 0;
                  }
                  this.waveshaperAlgorithms[this._algorithmIndex](this._curveAmount, this.k_nSamples, this.ws_table);
                  this.waveshaper.curve = this.ws_table;
              }
          },
          outputGain: {
              get: function() {
                  return this.outputDrive.gain;
              },
              set: function(value) {
                  this._outputGain = dbToWAVolume(value);
              }
          },
          algorithmIndex: {
              get: function() {
                  return this._algorithmIndex;
              },
              set: function(value) {
                  this._algorithmIndex = value;
                  this.curveAmount = this._curveAmount;
              }
          },
          waveshaperAlgorithms: {
              value: [
                  function(amount, n_samples, ws_table) {
                      amount = Math.min(amount, 0.9999);
                      var k = 2 * amount / (1 - amount),
                          i, x;
                      for (i = 0; i < n_samples; i++) {
                          x = i * 2 / n_samples - 1;
                          ws_table[i] = (1 + k) * x / (1 + k * Math.abs(x));
                      }
                  },
                  function(amount, n_samples, ws_table) {
                      var i, x, y;
                      for (i = 0; i < n_samples; i++) {
                          x = i * 2 / n_samples - 1;
                          y = ((0.5 * Math.pow((x + 1.4), 2)) - 1) * y >= 0 ? 5.8 : 1.2;
                          ws_table[i] = tanh(y);
                      }
                  },
                  function(amount, n_samples, ws_table) {
                      var i, x, y, a = 1 - amount;
                      for (i = 0; i < n_samples; i++) {
                          x = i * 2 / n_samples - 1;
                          y = x < 0 ? -Math.pow(Math.abs(x), a + 0.04) : Math.pow(x, a);
                          ws_table[i] = tanh(y * 2);
                      }
                  },
                  function(amount, n_samples, ws_table) {
                      var i, x, y, abx, a = 1 - amount > 0.99 ? 0.99 : 1 - amount;
                      for (i = 0; i < n_samples; i++) {
                          x = i * 2 / n_samples - 1;
                          abx = Math.abs(x);
                          if (abx < a) y = abx;
                          else if (abx > a) y = a + (abx - a) / (1 + Math.pow((abx - a) / (1 - a), 2));
                          else if (abx > 1) y = abx;
                          ws_table[i] = sign(x) * y * (1 / ((a + 1) / 2));
                      }
                  },
                  function(amount, n_samples, ws_table) { // fixed curve, amount doesn't do anything, the distortion is just from the drive
                      var i, x;
                      for (i = 0; i < n_samples; i++) {
                          x = i * 2 / n_samples - 1;
                          if (x < -0.08905) {
                              ws_table[i] = (-3 / 4) * (1 - (Math.pow((1 - (Math.abs(x) - 0.032857)), 12)) + (1 / 3) * (Math.abs(x) - 0.032847)) + 0.01;
                          } else if (x >= -0.08905 && x < 0.320018) {
                              ws_table[i] = (-6.153 * (x * x)) + 3.9375 * x;
                          } else {
                              ws_table[i] = 0.630035;
                          }
                      }
                  },
                  function(amount, n_samples, ws_table) {
                      var a = 2 + Math.round(amount * 14),
                          // we go from 2 to 16 bits, keep in mind for the UI
                          bits = Math.round(Math.pow(2, a - 1)),
                          // real number of quantization steps divided by 2
                          i, x;
                      for (i = 0; i < n_samples; i++) {
                          x = i * 2 / n_samples - 1;
                          ws_table[i] = Math.round(x * bits) / bits;
                      }
                  }
              ]
          }
      });

      Tuna.prototype.Panner = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }

          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.panner = userContext.createStereoPanner();
          this.output = userContext.createGain();

          this.activateNode.connect(this.panner);
          this.panner.connect(this.output);

          this.pan = initValue(properties.pan, this.defaults.pan.value);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Panner.prototype = Object.create(Super, {
          name: {
              value: "Panner"
          },
          defaults: {
              writable: true,
              value: {
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  },
                  pan: {
                      value: 0.0,
                      min: -1.0,
                      max: 1.0,
                      automatable: true,
                      type: FLOAT
                  }
              }
          },
          pan: {
              enumerable: true,
              get: function() {
                  return this.panner.pan;
              },
              set: function(value) {
                  this.panner.pan.value = value;
              }
          }
      });

      Tuna.prototype.Phaser = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.splitter = this.activateNode = userContext.createChannelSplitter(2);
          this.filtersL = [];
          this.filtersR = [];
          this.feedbackGainNodeL = userContext.createGain();
          this.feedbackGainNodeR = userContext.createGain();
          this.merger = userContext.createChannelMerger(2);
          this.filteredSignal = userContext.createGain();
          this.output = userContext.createGain();
          this.lfoL = new userInstance.LFO({
              target: this.filtersL,
              callback: this.callback
          });
          this.lfoR = new userInstance.LFO({
              target: this.filtersR,
              callback: this.callback
          });

          var i = this.stage;
          while (i--) {
              this.filtersL[i] = userContext.createBiquadFilter();
              this.filtersR[i] = userContext.createBiquadFilter();
              this.filtersL[i].type = "allpass";
              this.filtersR[i].type = "allpass";
          }
          this.input.connect(this.splitter);
          this.input.connect(this.output);
          this.splitter.connect(this.filtersL[0], 0, 0);
          this.splitter.connect(this.filtersR[0], 1, 0);
          this.connectInOrder(this.filtersL);
          this.connectInOrder(this.filtersR);
          this.filtersL[this.stage - 1].connect(this.feedbackGainNodeL);
          this.filtersL[this.stage - 1].connect(this.merger, 0, 0);
          this.filtersR[this.stage - 1].connect(this.feedbackGainNodeR);
          this.filtersR[this.stage - 1].connect(this.merger, 0, 1);
          this.feedbackGainNodeL.connect(this.filtersL[0]);
          this.feedbackGainNodeR.connect(this.filtersR[0]);
          this.merger.connect(this.output);

          this.rate = initValue(properties.rate, this.defaults.rate.value);
          this.baseModulationFrequency = properties.baseModulationFrequency || this.defaults.baseModulationFrequency.value;
          this.depth = initValue(properties.depth, this.defaults.depth.value);
          this.feedback = initValue(properties.feedback, this.defaults.feedback.value);
          this.stereoPhase = initValue(properties.stereoPhase, this.defaults.stereoPhase.value);

          this.lfoL.activate(true);
          this.lfoR.activate(true);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Phaser.prototype = Object.create(Super, {
          name: {
              value: "Phaser"
          },
          stage: {
              value: 4
          },
          defaults: {
              writable: true,
              value: {
                  rate: {
                      value: 0.1,
                      min: 0,
                      max: 8,
                      automatable: false,
                      type: FLOAT
                  },
                  depth: {
                      value: 0.6,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  feedback: {
                      value: 0.7,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  stereoPhase: {
                      value: 40,
                      min: 0,
                      max: 180,
                      automatable: false,
                      type: FLOAT
                  },
                  baseModulationFrequency: {
                      value: 700,
                      min: 500,
                      max: 1500,
                      automatable: false,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          callback: {
              value: function(filters, value) {
                  for (var stage = 0; stage < 4; stage++) {
                      filters[stage].frequency.value = value;
                  }
              }
          },
          depth: {
              get: function() {
                  return this._depth;
              },
              set: function(value) {
                  this._depth = value;
                  this.lfoL.oscillation = this._baseModulationFrequency * this._depth;
                  this.lfoR.oscillation = this._baseModulationFrequency * this._depth;
              }
          },
          rate: {
              get: function() {
                  return this._rate;
              },
              set: function(value) {
                  this._rate = value;
                  this.lfoL.frequency = this._rate;
                  this.lfoR.frequency = this._rate;
              }
          },
          baseModulationFrequency: {
              enumerable: true,
              get: function() {
                  return this._baseModulationFrequency;
              },
              set: function(value) {
                  this._baseModulationFrequency = value;
                  this.lfoL.offset = this._baseModulationFrequency;
                  this.lfoR.offset = this._baseModulationFrequency;
                  this._depth = this._depth;
              }
          },
          feedback: {
              get: function() {
                  return this._feedback;
              },
              set: function(value) {
                  this._feedback = value;
                  this.feedbackGainNodeL.gain.value = this._feedback;
                  this.feedbackGainNodeR.gain.value = this._feedback;
              }
          },
          stereoPhase: {
              get: function() {
                  return this._stereoPhase;
              },
              set: function(value) {
                  this._stereoPhase = value;
                  var newPhase = this.lfoL._phase + this._stereoPhase * Math.PI / 180;
                  newPhase = fmod(newPhase, 2 * Math.PI);
                  this.lfoR._phase = newPhase;
              }
          }
      });

      Tuna.prototype.PingPongDelay = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.wet = userContext.createGain();
          this.stereoToMonoMix = userContext.createGain();
          this.feedbackLevel = userContext.createGain();
          this.output = userContext.createGain();
          this.delayLeft = userContext.createDelay(10);
          this.delayRight = userContext.createDelay(10);

          this.activateNode = userContext.createGain();
          this.splitter = userContext.createChannelSplitter(2);
          this.merger = userContext.createChannelMerger(2);

          this.activateNode.connect(this.splitter);
          this.splitter.connect(this.stereoToMonoMix, 0, 0);
          this.splitter.connect(this.stereoToMonoMix, 1, 0);
          this.stereoToMonoMix.gain.value = .5;
          this.stereoToMonoMix.connect(this.wet);
          this.wet.connect(this.delayLeft);
          this.feedbackLevel.connect(this.wet);
          this.delayLeft.connect(this.delayRight);
          this.delayRight.connect(this.feedbackLevel);
          this.delayLeft.connect(this.merger, 0, 0);
          this.delayRight.connect(this.merger, 0, 1);
          this.merger.connect(this.output);
          this.activateNode.connect(this.output);

          this.delayTimeLeft = properties.delayTimeLeft !== undefined ? properties.delayTimeLeft : this.defaults.delayTimeLeft.value;
          this.delayTimeRight = properties.delayTimeRight !== undefined ? properties.delayTimeRight : this.defaults.delayTimeRight.value;
          this.feedbackLevel.gain.value = properties.feedback !== undefined ? properties.feedback : this.defaults.feedback.value;
          this.wet.gain.value = properties.wetLevel !== undefined ? properties.wetLevel : this.defaults.wetLevel.value;
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.PingPongDelay.prototype = Object.create(Super, {
          name: {
              value: "PingPongDelay"
          },
          delayTimeLeft: {
              enumerable: true,
              get: function() {
                  return this._delayTimeLeft;
              },
              set: function(value) {
                  this._delayTimeLeft = value;
                  this.delayLeft.delayTime.value = value / 1000;
              }
          },
          delayTimeRight: {
              enumerable: true,
              get: function() {
                  return this._delayTimeRight;
              },
              set: function(value) {
                  this._delayTimeRight = value;
                  this.delayRight.delayTime.value = value / 1000;
              }
          },
          wetLevel: {
              enumerable: true,
              get: function () {
                  return this.wet.gain;
              },
              set: function (value) {
                  this.wet.gain.value = value;
              }
          }, 
          feedback: {
              enumerable: true,
              get: function () {
                  return this.feedbackLevel.gain;
              },
              set: function (value) {
                  this.feedbackLevel.gain.value = value;
              }
          },
          defaults: {
              writable: true,
              value: {
                  delayTimeLeft: {
                      value: 200,
                      min: 1,
                      max: 10000,
                      automatable: false,
                      type: INT
                  },
                  delayTimeRight: {
                      value: 400,
                      min: 1,
                      max: 10000,
                      automatable: false,
                      type: INT
                  },
                  feedback: {
                      value: 0.3,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  wetLevel: {
                      value: 0.5,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          }
      });

      Tuna.prototype.Tremolo = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.splitter = this.activateNode = userContext.createChannelSplitter(
                  2),
              this.amplitudeL = userContext.createGain(),
              this.amplitudeR = userContext.createGain(),
              this.merger = userContext.createChannelMerger(2),
              this.output = userContext.createGain();
          this.lfoL = new userInstance.LFO({
              target: this.amplitudeL.gain,
              callback: pipe
          });
          this.lfoR = new userInstance.LFO({
              target: this.amplitudeR.gain,
              callback: pipe
          });

          this.input.connect(this.splitter);
          this.splitter.connect(this.amplitudeL, 0);
          this.splitter.connect(this.amplitudeR, 1);
          this.amplitudeL.connect(this.merger, 0, 0);
          this.amplitudeR.connect(this.merger, 0, 1);
          this.merger.connect(this.output);

          this.rate = properties.rate || this.defaults.rate.value;
          this.intensity = initValue(properties.intensity, this.defaults.intensity.value);
          this.stereoPhase = initValue(properties.stereoPhase, this.defaults.stereoPhase.value);

          this.lfoL.offset = 1 - (this.intensity / 2);
          this.lfoR.offset = 1 - (this.intensity / 2);
          this.lfoL.phase = this.stereoPhase * Math.PI / 180;

          this.lfoL.activate(true);
          this.lfoR.activate(true);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.Tremolo.prototype = Object.create(Super, {
          name: {
              value: "Tremolo"
          },
          defaults: {
              writable: true,
              value: {
                  intensity: {
                      value: 0.3,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  stereoPhase: {
                      value: 0,
                      min: 0,
                      max: 180,
                      automatable: false,
                      type: FLOAT
                  },
                  rate: {
                      value: 5,
                      min: 0.1,
                      max: 11,
                      automatable: false,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          intensity: {
              enumerable: true,
              get: function() {
                  return this._intensity;
              },
              set: function(value) {
                  this._intensity = value;
                  this.lfoL.offset = 1 - this._intensity / 2;
                  this.lfoR.offset = 1 - this._intensity / 2;
                  this.lfoL.oscillation = this._intensity;
                  this.lfoR.oscillation = this._intensity;
              }
          },
          rate: {
              enumerable: true,
              get: function() {
                  return this._rate;
              },
              set: function(value) {
                  this._rate = value;
                  this.lfoL.frequency = this._rate;
                  this.lfoR.frequency = this._rate;
              }
          },
          stereoPhase: {
              enumerable: true,
              get: function() {
                  return this._stereoPhase;
              },
              set: function(value) {
                  this._stereoPhase = value;
                  var newPhase = this.lfoL._phase + this._stereoPhase * Math.PI / 180;
                  newPhase = fmod(newPhase, 2 * Math.PI);
                  this.lfoR.phase = newPhase;
              }
          }
      });

      Tuna.prototype.WahWah = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.activateNode = userContext.createGain();
          this.envelopeFollower = new userInstance.EnvelopeFollower({
              target: this,
              callback: function(context, value) {
                  context.sweep = value;
              }
          });
          this.filterBp = userContext.createBiquadFilter();
          this.filterPeaking = userContext.createBiquadFilter();
          this.output = userContext.createGain();

          //Connect AudioNodes
          this.activateNode.connect(this.filterBp);
          this.filterBp.connect(this.filterPeaking);
          this.filterPeaking.connect(this.output);

          //Set Properties
          this.init();
          this.automode = initValue(properties.automode, this.defaults.automode.value);
          this.resonance = properties.resonance || this.defaults.resonance.value;
          this.sensitivity = initValue(properties.sensitivity, this.defaults.sensitivity.value);
          this.baseFrequency = initValue(properties.baseFrequency, this.defaults.baseFrequency.value);
          this.excursionOctaves = properties.excursionOctaves || this.defaults.excursionOctaves.value;
          this.sweep = initValue(properties.sweep, this.defaults.sweep.value);

          this.activateNode.gain.value = 2;
          this.envelopeFollower.activate(true);
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.WahWah.prototype = Object.create(Super, {
          name: {
              value: "WahWah"
          },
          defaults: {
              writable: true,
              value: {
                  automode: {
                      value: true,
                      automatable: false,
                      type: BOOLEAN
                  },
                  baseFrequency: {
                      value: 0.5,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  excursionOctaves: {
                      value: 2,
                      min: 1,
                      max: 6,
                      automatable: false,
                      type: FLOAT
                  },
                  sweep: {
                      value: 0.2,
                      min: 0,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  resonance: {
                      value: 10,
                      min: 1,
                      max: 100,
                      automatable: false,
                      type: FLOAT
                  },
                  sensitivity: {
                      value: 0.5,
                      min: -1,
                      max: 1,
                      automatable: false,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          automode: {
              get: function() {
                  return this._automode;
              },
              set: function(value) {
                  this._automode = value;
                  if (value) {
                      this.activateNode.connect(this.envelopeFollower.input);
                      this.envelopeFollower.activate(true);
                  } else {
                      this.envelopeFollower.activate(false);
                      this.activateNode.disconnect();
                      this.activateNode.connect(this.filterBp);
                  }
              }
          },
          filterFreqTimeout: {
              value: 0,
              writable: true
          },
          setFilterFreq: {
              value: function() {
                  try {
                      this.filterBp.frequency.setValueAtTime(Math.min(22050, this._baseFrequency + this._excursionFrequency * this._sweep), 0, 0);
                      this.filterPeaking.frequency.setValueAtTime(Math.min(22050, this._baseFrequency + this._excursionFrequency * this._sweep), 0, 0);
                  } catch (e) {
                      clearTimeout(this.filterFreqTimeout);
                      //put on the next cycle to let all init properties be set
                      this.filterFreqTimeout = setTimeout(function() {
                          this.setFilterFreq();
                      }.bind(this), 0);
                  }
              }
          },
          sweep: {
              enumerable: true,
              get: function() {
                  return this._sweep;
              },
              set: function(value) {
                  this._sweep = Math.pow(value > 1 ? 1 : value < 0 ? 0 : value, this._sensitivity);
                  this.setFilterFreq();
              }
          },
          baseFrequency: {
              enumerable: true,
              get: function() {
                  return this._baseFrequency;
              },
              set: function(value) {
                  this._baseFrequency = 50 * Math.pow(10, value * 2);
                  this._excursionFrequency = Math.min(userContext.sampleRate / 2, this.baseFrequency * Math.pow(2, this._excursionOctaves));
                  this.setFilterFreq();
              }
          },
          excursionOctaves: {
              enumerable: true,
              get: function() {
                  return this._excursionOctaves;
              },
              set: function(value) {
                  this._excursionOctaves = value;
                  this._excursionFrequency = Math.min(userContext.sampleRate / 2, this.baseFrequency * Math.pow(2, this._excursionOctaves));
                  this.setFilterFreq();
              }
          },
          sensitivity: {
              enumerable: true,
              get: function() {
                  return this._sensitivity;
              },
              set: function(value) {
                  this._sensitivity = Math.pow(10, value);
              }
          },
          resonance: {
              enumerable: true,
              get: function() {
                  return this._resonance;
              },
              set: function(value) {
                  this._resonance = value;
                  this.filterPeaking.Q.setValueAtTime(this._resonance, 0, 0);
              }
          },
          init: {
              value: function() {
                  this.output.gain.value = 1;
                  this.filterPeaking.type = "peaking";
                  this.filterBp.type = "bandpass";
                  this.filterPeaking.frequency.value = 100;
                  this.filterPeaking.gain.value = 20;
                  this.filterPeaking.Q.value = 5;
                  this.filterBp.frequency.value = 100;
                  this.filterBp.Q.value = 1;
              }
          }
      });

      Tuna.prototype.EnvelopeFollower = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }
          this.input = userContext.createGain();
          this.jsNode = this.output = userContext.createScriptProcessor(this.buffersize, 1, 1);

          this.input.connect(this.output);

          this.attackTime = initValue(properties.attackTime, this.defaults.attackTime.value);
          this.releaseTime = initValue(properties.releaseTime, this.defaults.releaseTime.value);
          this._envelope = 0;
          this.target = properties.target || {};
          this.callback = properties.callback || function() {};

          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.EnvelopeFollower.prototype = Object.create(Super, {
          name: {
              value: "EnvelopeFollower"
          },
          defaults: {
              value: {
                  attackTime: {
                      value: 0.003,
                      min: 0,
                      max: 0.5,
                      automatable: false,
                      type: FLOAT
                  },
                  releaseTime: {
                      value: 0.5,
                      min: 0,
                      max: 0.5,
                      automatable: false,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          buffersize: {
              value: 256
          },
          envelope: {
              value: 0
          },
          sampleRate: {
              value: 44100
          },
          attackTime: {
              enumerable: true,
              get: function() {
                  return this._attackTime;
              },
              set: function(value) {
                  this._attackTime = value;
                  this._attackC = Math.exp(-1 / this._attackTime * this.sampleRate / this.buffersize);
              }
          },
          releaseTime: {
              enumerable: true,
              get: function() {
                  return this._releaseTime;
              },
              set: function(value) {
                  this._releaseTime = value;
                  this._releaseC = Math.exp(-1 / this._releaseTime * this.sampleRate / this.buffersize);
              }
          },
          callback: {
              get: function() {
                  return this._callback;
              },
              set: function(value) {
                  if (typeof value === "function") {
                      this._callback = value;
                  } else {
                      console.error("tuna.js: " + this.name + ": Callback must be a function!");
                  }
              }
          },
          target: {
              get: function() {
                  return this._target;
              },
              set: function(value) {
                  this._target = value;
              }
          },
          activate: {
              value: function(doActivate) {
                  this.activated = doActivate;
                  if (doActivate) {
                      this.jsNode.connect(userContext.destination);
                      this.jsNode.onaudioprocess = this.returnCompute(this);
                  } else {
                      this.jsNode.disconnect();
                      this.jsNode.onaudioprocess = null;
                  }
                  if (this.activateCallback) {
                      this.activateCallback(doActivate);
                  }
              }
          },
          returnCompute: {
              value: function(instance) {
                  return function(event) {
                      instance.compute(event);
                  };
              }
          },
          compute: {
              value: function(event) {
                  var count = event.inputBuffer.getChannelData(0).length,
                      channels = event.inputBuffer.numberOfChannels,
                      current, chan, rms, i;
                  chan = rms = i = 0;
                  if (channels > 1) { //need to mixdown
                      for (i = 0; i < count; ++i) {
                          for (; chan < channels; ++chan) {
                              current = event.inputBuffer.getChannelData(chan)[i];
                              rms += (current * current) / channels;
                          }
                      }
                  } else {
                      for (i = 0; i < count; ++i) {
                          current = event.inputBuffer.getChannelData(0)[i];
                          rms += (current * current);
                      }
                  }
                  rms = Math.sqrt(rms);

                  if (this._envelope < rms) {
                      this._envelope *= this._attackC;
                      this._envelope += (1 - this._attackC) * rms;
                  } else {
                      this._envelope *= this._releaseC;
                      this._envelope += (1 - this._releaseC) * rms;
                  }
                  this._callback(this._target, this._envelope);
              }
          }
      });

      Tuna.prototype.LFO = function(properties) {
          if (!properties) {
              properties = this.getDefaults();
          }

          //Instantiate AudioNode
          this.input = userContext.createGain();
          this.output = userContext.createScriptProcessor(256, 1, 1);
          this.activateNode = userContext.destination;

          //Set Properties
          this.frequency = initValue(properties.frequency, this.defaults.frequency.value);
          this.offset = initValue(properties.offset, this.defaults.offset.value);
          this.oscillation = initValue(properties.oscillation, this.defaults.oscillation.value);
          this.phase = initValue(properties.phase, this.defaults.phase.value);
          this.target = properties.target || {};
          this.output.onaudioprocess = this.callback(properties.callback || function() {});
          this.bypass = properties.bypass || this.defaults.bypass.value;
      };
      Tuna.prototype.LFO.prototype = Object.create(Super, {
          name: {
              value: "LFO"
          },
          bufferSize: {
              value: 256
          },
          sampleRate: {
              value: 44100
          },
          defaults: {
              value: {
                  frequency: {
                      value: 1,
                      min: 0,
                      max: 20,
                      automatable: false,
                      type: FLOAT
                  },
                  offset: {
                      value: 0.85,
                      min: 0,
                      max: 22049,
                      automatable: false,
                      type: FLOAT
                  },
                  oscillation: {
                      value: 0.3,
                      min: -22050,
                      max: 22050,
                      automatable: false,
                      type: FLOAT
                  },
                  phase: {
                      value: 0,
                      min: 0,
                      max: 2 * Math.PI,
                      automatable: false,
                      type: FLOAT
                  },
                  bypass: {
                      value: false,
                      automatable: false,
                      type: BOOLEAN
                  }
              }
          },
          frequency: {
              get: function() {
                  return this._frequency;
              },
              set: function(value) {
                  this._frequency = value;
                  this._phaseInc = 2 * Math.PI * this._frequency * this.bufferSize / this.sampleRate;
              }
          },
          offset: {
              get: function() {
                  return this._offset;
              },
              set: function(value) {
                  this._offset = value;
              }
          },
          oscillation: {
              get: function() {
                  return this._oscillation;
              },
              set: function(value) {
                  this._oscillation = value;
              }
          },
          phase: {
              get: function() {
                  return this._phase;
              },
              set: function(value) {
                  this._phase = value;
              }
          },
          target: {
              get: function() {
                  return this._target;
              },
              set: function(value) {
                  this._target = value;
              }
          },
          activate: {
              value: function(doActivate) {
                  if (doActivate) {
                      this.output.connect(userContext.destination);
                      if (this.activateCallback) {
                          this.activateCallback(doActivate);
                      }
                  } else {
                      this.output.disconnect();
                  }
              }
          },
          callback: {
              value: function(callback) {
                  var that = this;
                  return function() {
                      that._phase += that._phaseInc;
                      if (that._phase > 2 * Math.PI) {
                          that._phase = 0;
                      }
                      callback(that._target, that._offset + that._oscillation * Math.sin(that._phase));
                  };
              }
          }
      });

      Tuna.toString = Tuna.prototype.toString = function() {
          return "Please visit https://github.com/Theodeus/tuna/wiki for instructions on how to use Tuna.js";
      };
  })();
  });

  var biquad  = (bufferSource, offlineAudioCtx, config) => {
    if (config.biquad.randomize) {
      var waveArray = new Float32Array(config.biquad.randomValues);
      for (i=0;i<config.biquad.randomValues;i++) {
        waveArray[i] = window.random.real(0.0001, config.biquad.biquadFrequency); 
      }
    }
    var biquadFilter = offlineAudioCtx.createBiquadFilter();
    biquadFilter.type = config.biquad.type;
    if (config.biquad.randomize) {
      biquadFilter.frequency.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
      biquadFilter.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
    } else if (config.biquad.enablePartial) {
      biquadFilter.frequency.setTargetAtTime(config.biquad.biquadFrequency, config.biquad.areaOfEffect, config.biquad.areaOfEffect);
    } else {
      biquadFilter.frequency.value = config.biquad.biquadFrequency;
    }  biquadFilter.Q.value = config.biquad.quality;
    biquadFilter.detune.value = config.biquad.detune;
    return biquadFilter;
  };

  var bitcrusher = (tuna, config) => {
    return new tuna.Bitcrusher({
      bits: config.bitcrusher.bits,
      normfreq: config.bitcrusher.normfreq,
      bufferSize: config.bitcrusher.bufferSize
    });
  };

  var chorus = (tuna, config) => {
    return new tuna.Chorus({
      feedback: config.chorus.feedback,
      delay: config.chorus.delay,
      depth: config.chorus.depth,
      rate: config.chorus.rate,
    });
  };

  var convolver = (tuna, config) => {
    return new tuna.Convolver({
      highCut: config.convolver.highCut,
      lowCut: config.convolver.lowCut,
      dryLevel: config.convolver.dryLevel,
      wetLevel: config.convolver.wetLevel,
      level: config.convolver.level,
      impulse: config.convolver.impulse
    });
  };

  var detune = (bufferSource, config) => {
    if (config.detune.randomize) {
      var waveArray = new Float32Array(config.detune.randomValues);
      for (i=0;i<config.detune.randomValues;i++) {
        waveArray[i] = window.random.real(0.0001, 400); 
      }
    }
    if (config.detune.randomize) {
      bufferSource.detune.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
    } else if (config.detune.enablePartial) {
      bufferSource.detune.setTargetAtTime(config.detune.value, config.detune.areaOfEffect, config.detune.areaOfEffect);
    } else {
      bufferSource.detune.value = config.detune.value;
    }  return bufferSource;
  };

  var gain = (config) => {
    const gainNode = offlineAudioCtx.createGain();
    gainNode.gain.value = config.gain.value;
    return gainNode;
  };

  var phaser = (tuna, config) => { 
    return new tuna.Phaser({
      rate: config.phaser.rate,
      depth: config.phaser.depth,
      feedback: config.phaser.feedback,
      stereoPhase: config.phaser.stereoPhase,
      baseModulationFrequency: config.phaser.baseModulationFrequency
    });
  };

  var pingPong = (tuna, config) => { 
    return new tuna.PingPongDelay({
      wetLevel: config.pingPong.wetLevel,
      feedback: config.pingPong.feedback,
      delayTimeLeft: config.pingPong.delayTimeLeft,
      delayTimeRight: config.pingPong.delayTimeRight
    });
  };

  var playbackRate = (bufferSource, config) => {
    if (config.playbackRate.randomize) {
      var waveArray = new Float32Array(config.playbackRate.randomValues);
      for (i=0;i<config.playbackRate.randomValues;i++) {
        waveArray[i] = window.random.integer(0.0001, 8); 
      }
      bufferSource.playbackRate.setValueCurveAtTime(waveArray, 0, bufferSource.buffer.duration);
    } else if (config.playbackRate.enablePartial) {
      bufferSource.playbackRate.setTargetAtTime(config.playbackRate.value, config.playbackRate.areaOfEffect, config.playbackRate.areaOfEffect);
    } else {
      bufferSource.playbackRate.value = config.playbackRate.value;
    }  return bufferSource;
  };

  var wahwah = (tuna, config) => {
    return new tuna.WahWah({
      automode: config.wahwah.automode,
      baseFrequency: config.wahwah.baseFrequency,
      excursionOctaves: config.wahwah.excursionOctaves,
      sweep: config.wahwah.sweep,
      resonance: config.wahwah.resonance,
      sensitivity: config.wahwah.sensitivity
    });
  };

  var biquad$1 = biquad;
  var bitcrusher$1 = bitcrusher;
  var chorus$1 = chorus;
  var convolver$1 = convolver;
  var detune$1 = detune;
  var gain$1 = gain;
  var phaser$1 = phaser;
  var pingPong$1 = pingPong;
  var playbackRate$1 = playbackRate;
  var wahwah$1 = wahwah;

  var effects$1 = {
  	biquad: biquad$1,
  	bitcrusher: bitcrusher$1,
  	chorus: chorus$1,
  	convolver: convolver$1,
  	detune: detune$1,
  	gain: gain$1,
  	phaser: phaser$1,
  	pingPong: pingPong$1,
  	playbackRate: playbackRate$1,
  	wahwah: wahwah$1
  };

  var random = createCommonjsModule(function (module) {
  /*jshint eqnull:true*/
  (function (root) {

    var GLOBAL_KEY = "Random";

    var imul = (typeof Math.imul !== "function" || Math.imul(0xffffffff, 5) !== -5 ?
      function (a, b) {
        var ah = (a >>> 16) & 0xffff;
        var al = a & 0xffff;
        var bh = (b >>> 16) & 0xffff;
        var bl = b & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return (al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0;
      } :
      Math.imul);

    var stringRepeat = (typeof String.prototype.repeat === "function" && "x".repeat(3) === "xxx" ?
      function (x, y) {
        return x.repeat(y);
      } : function (pattern, count) {
        var result = "";
        while (count > 0) {
          if (count & 1) {
            result += pattern;
          }
          count >>= 1;
          pattern += pattern;
        }
        return result;
      });

    function Random(engine) {
      if (!(this instanceof Random)) {
        return new Random(engine);
      }

      if (engine == null) {
        engine = Random.engines.nativeMath;
      } else if (typeof engine !== "function") {
        throw new TypeError("Expected engine to be a function, got " + typeof engine);
      }
      this.engine = engine;
    }
    var proto = Random.prototype;

    Random.engines = {
      nativeMath: function () {
        return (Math.random() * 0x100000000) | 0;
      },
      mt19937: (function (Int32Array) {
        // http://en.wikipedia.org/wiki/Mersenne_twister
        function refreshData(data) {
          var k = 0;
          var tmp = 0;
          for (;
            (k | 0) < 227; k = (k + 1) | 0) {
            tmp = (data[k] & 0x80000000) | (data[(k + 1) | 0] & 0x7fffffff);
            data[k] = data[(k + 397) | 0] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
          }

          for (;
            (k | 0) < 623; k = (k + 1) | 0) {
            tmp = (data[k] & 0x80000000) | (data[(k + 1) | 0] & 0x7fffffff);
            data[k] = data[(k - 227) | 0] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
          }

          tmp = (data[623] & 0x80000000) | (data[0] & 0x7fffffff);
          data[623] = data[396] ^ (tmp >>> 1) ^ ((tmp & 0x1) ? 0x9908b0df : 0);
        }

        function temper(value) {
          value ^= value >>> 11;
          value ^= (value << 7) & 0x9d2c5680;
          value ^= (value << 15) & 0xefc60000;
          return value ^ (value >>> 18);
        }

        function seedWithArray(data, source) {
          var i = 1;
          var j = 0;
          var sourceLength = source.length;
          var k = Math.max(sourceLength, 624) | 0;
          var previous = data[0] | 0;
          for (;
            (k | 0) > 0; --k) {
            data[i] = previous = ((data[i] ^ imul((previous ^ (previous >>> 30)), 0x0019660d)) + (source[j] | 0) + (j | 0)) | 0;
            i = (i + 1) | 0;
            ++j;
            if ((i | 0) > 623) {
              data[0] = data[623];
              i = 1;
            }
            if (j >= sourceLength) {
              j = 0;
            }
          }
          for (k = 623;
            (k | 0) > 0; --k) {
            data[i] = previous = ((data[i] ^ imul((previous ^ (previous >>> 30)), 0x5d588b65)) - i) | 0;
            i = (i + 1) | 0;
            if ((i | 0) > 623) {
              data[0] = data[623];
              i = 1;
            }
          }
          data[0] = 0x80000000;
        }

        function mt19937() {
          var data = new Int32Array(624);
          var index = 0;
          var uses = 0;

          function next() {
            if ((index | 0) >= 624) {
              refreshData(data);
              index = 0;
            }

            var value = data[index];
            index = (index + 1) | 0;
            uses += 1;
            return temper(value) | 0;
          }
          next.getUseCount = function() {
            return uses;
          };
          next.discard = function (count) {
            uses += count;
            if ((index | 0) >= 624) {
              refreshData(data);
              index = 0;
            }
            while ((count - index) > 624) {
              count -= 624 - index;
              refreshData(data);
              index = 0;
            }
            index = (index + count) | 0;
            return next;
          };
          next.seed = function (initial) {
            var previous = 0;
            data[0] = previous = initial | 0;

            for (var i = 1; i < 624; i = (i + 1) | 0) {
              data[i] = previous = (imul((previous ^ (previous >>> 30)), 0x6c078965) + i) | 0;
            }
            index = 624;
            uses = 0;
            return next;
          };
          next.seedWithArray = function (source) {
            next.seed(0x012bd6aa);
            seedWithArray(data, source);
            return next;
          };
          next.autoSeed = function () {
            return next.seedWithArray(Random.generateEntropyArray());
          };
          return next;
        }

        return mt19937;
      }(typeof Int32Array === "function" ? Int32Array : Array)),
      browserCrypto: (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" && typeof Int32Array === "function") ? (function () {
        var data = null;
        var index = 128;

        return function () {
          if (index >= 128) {
            if (data === null) {
              data = new Int32Array(128);
            }
            crypto.getRandomValues(data);
            index = 0;
          }

          return data[index++] | 0;
        };
      }()) : null
    };

    Random.generateEntropyArray = function () {
      var array = [];
      var engine = Random.engines.nativeMath;
      for (var i = 0; i < 16; ++i) {
        array[i] = engine() | 0;
      }
      array.push(new Date().getTime() | 0);
      return array;
    };

    function returnValue(value) {
      return function () {
        return value;
      };
    }

    // [-0x80000000, 0x7fffffff]
    Random.int32 = function (engine) {
      return engine() | 0;
    };
    proto.int32 = function () {
      return Random.int32(this.engine);
    };

    // [0, 0xffffffff]
    Random.uint32 = function (engine) {
      return engine() >>> 0;
    };
    proto.uint32 = function () {
      return Random.uint32(this.engine);
    };

    // [0, 0x1fffffffffffff]
    Random.uint53 = function (engine) {
      var high = engine() & 0x1fffff;
      var low = engine() >>> 0;
      return (high * 0x100000000) + low;
    };
    proto.uint53 = function () {
      return Random.uint53(this.engine);
    };

    // [0, 0x20000000000000]
    Random.uint53Full = function (engine) {
      while (true) {
        var high = engine() | 0;
        if (high & 0x200000) {
          if ((high & 0x3fffff) === 0x200000 && (engine() | 0) === 0) {
            return 0x20000000000000;
          }
        } else {
          var low = engine() >>> 0;
          return ((high & 0x1fffff) * 0x100000000) + low;
        }
      }
    };
    proto.uint53Full = function () {
      return Random.uint53Full(this.engine);
    };

    // [-0x20000000000000, 0x1fffffffffffff]
    Random.int53 = function (engine) {
      var high = engine() | 0;
      var low = engine() >>> 0;
      return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
    };
    proto.int53 = function () {
      return Random.int53(this.engine);
    };

    // [-0x20000000000000, 0x20000000000000]
    Random.int53Full = function (engine) {
      while (true) {
        var high = engine() | 0;
        if (high & 0x400000) {
          if ((high & 0x7fffff) === 0x400000 && (engine() | 0) === 0) {
            return 0x20000000000000;
          }
        } else {
          var low = engine() >>> 0;
          return ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
        }
      }
    };
    proto.int53Full = function () {
      return Random.int53Full(this.engine);
    };

    function add(generate, addend) {
      if (addend === 0) {
        return generate;
      } else {
        return function (engine) {
          return generate(engine) + addend;
        };
      }
    }

    Random.integer = (function () {
      function isPowerOfTwoMinusOne(value) {
        return ((value + 1) & value) === 0;
      }

      function bitmask(masking) {
        return function (engine) {
          return engine() & masking;
        };
      }

      function downscaleToLoopCheckedRange(range) {
        var extendedRange = range + 1;
        var maximum = extendedRange * Math.floor(0x100000000 / extendedRange);
        return function (engine) {
          var value = 0;
          do {
            value = engine() >>> 0;
          } while (value >= maximum);
          return value % extendedRange;
        };
      }

      function downscaleToRange(range) {
        if (isPowerOfTwoMinusOne(range)) {
          return bitmask(range);
        } else {
          return downscaleToLoopCheckedRange(range);
        }
      }

      function isEvenlyDivisibleByMaxInt32(value) {
        return (value | 0) === 0;
      }

      function upscaleWithHighMasking(masking) {
        return function (engine) {
          var high = engine() & masking;
          var low = engine() >>> 0;
          return (high * 0x100000000) + low;
        };
      }

      function upscaleToLoopCheckedRange(extendedRange) {
        var maximum = extendedRange * Math.floor(0x20000000000000 / extendedRange);
        return function (engine) {
          var ret = 0;
          do {
            var high = engine() & 0x1fffff;
            var low = engine() >>> 0;
            ret = (high * 0x100000000) + low;
          } while (ret >= maximum);
          return ret % extendedRange;
        };
      }

      function upscaleWithinU53(range) {
        var extendedRange = range + 1;
        if (isEvenlyDivisibleByMaxInt32(extendedRange)) {
          var highRange = ((extendedRange / 0x100000000) | 0) - 1;
          if (isPowerOfTwoMinusOne(highRange)) {
            return upscaleWithHighMasking(highRange);
          }
        }
        return upscaleToLoopCheckedRange(extendedRange);
      }

      function upscaleWithinI53AndLoopCheck(min, max) {
        return function (engine) {
          var ret = 0;
          do {
            var high = engine() | 0;
            var low = engine() >>> 0;
            ret = ((high & 0x1fffff) * 0x100000000) + low + (high & 0x200000 ? -0x20000000000000 : 0);
          } while (ret < min || ret > max);
          return ret;
        };
      }

      return function (min, max) {
        min = Math.floor(min);
        max = Math.floor(max);
        if (min < -0x20000000000000 || !isFinite(min)) {
          throw new RangeError("Expected min to be at least " + (-0x20000000000000));
        } else if (max > 0x20000000000000 || !isFinite(max)) {
          throw new RangeError("Expected max to be at most " + 0x20000000000000);
        }

        var range = max - min;
        if (range <= 0 || !isFinite(range)) {
          return returnValue(min);
        } else if (range === 0xffffffff) {
          if (min === 0) {
            return Random.uint32;
          } else {
            return add(Random.int32, min + 0x80000000);
          }
        } else if (range < 0xffffffff) {
          return add(downscaleToRange(range), min);
        } else if (range === 0x1fffffffffffff) {
          return add(Random.uint53, min);
        } else if (range < 0x1fffffffffffff) {
          return add(upscaleWithinU53(range), min);
        } else if (max - 1 - min === 0x1fffffffffffff) {
          return add(Random.uint53Full, min);
        } else if (min === -0x20000000000000 && max === 0x20000000000000) {
          return Random.int53Full;
        } else if (min === -0x20000000000000 && max === 0x1fffffffffffff) {
          return Random.int53;
        } else if (min === -0x1fffffffffffff && max === 0x20000000000000) {
          return add(Random.int53, 1);
        } else if (max === 0x20000000000000) {
          return add(upscaleWithinI53AndLoopCheck(min - 1, max - 1), 1);
        } else {
          return upscaleWithinI53AndLoopCheck(min, max);
        }
      };
    }());
    proto.integer = function (min, max) {
      return Random.integer(min, max)(this.engine);
    };

    // [0, 1] (floating point)
    Random.realZeroToOneInclusive = function (engine) {
      return Random.uint53Full(engine) / 0x20000000000000;
    };
    proto.realZeroToOneInclusive = function () {
      return Random.realZeroToOneInclusive(this.engine);
    };

    // [0, 1) (floating point)
    Random.realZeroToOneExclusive = function (engine) {
      return Random.uint53(engine) / 0x20000000000000;
    };
    proto.realZeroToOneExclusive = function () {
      return Random.realZeroToOneExclusive(this.engine);
    };

    Random.real = (function () {
      function multiply(generate, multiplier) {
        if (multiplier === 1) {
          return generate;
        } else if (multiplier === 0) {
          return function () {
            return 0;
          };
        } else {
          return function (engine) {
            return generate(engine) * multiplier;
          };
        }
      }

      return function (left, right, inclusive) {
        if (!isFinite(left)) {
          throw new RangeError("Expected left to be a finite number");
        } else if (!isFinite(right)) {
          throw new RangeError("Expected right to be a finite number");
        }
        return add(
          multiply(
            inclusive ? Random.realZeroToOneInclusive : Random.realZeroToOneExclusive,
            right - left),
          left);
      };
    }());
    proto.real = function (min, max, inclusive) {
      return Random.real(min, max, inclusive)(this.engine);
    };

    Random.bool = (function () {
      function isLeastBitTrue(engine) {
        return (engine() & 1) === 1;
      }

      function lessThan(generate, value) {
        return function (engine) {
          return generate(engine) < value;
        };
      }

      function probability(percentage) {
        if (percentage <= 0) {
          return returnValue(false);
        } else if (percentage >= 1) {
          return returnValue(true);
        } else {
          var scaled = percentage * 0x100000000;
          if (scaled % 1 === 0) {
            return lessThan(Random.int32, (scaled - 0x80000000) | 0);
          } else {
            return lessThan(Random.uint53, Math.round(percentage * 0x20000000000000));
          }
        }
      }

      return function (numerator, denominator) {
        if (denominator == null) {
          if (numerator == null) {
            return isLeastBitTrue;
          }
          return probability(numerator);
        } else {
          if (numerator <= 0) {
            return returnValue(false);
          } else if (numerator >= denominator) {
            return returnValue(true);
          }
          return lessThan(Random.integer(0, denominator - 1), numerator);
        }
      };
    }());
    proto.bool = function (numerator, denominator) {
      return Random.bool(numerator, denominator)(this.engine);
    };

    function toInteger(value) {
      var number = +value;
      if (number < 0) {
        return Math.ceil(number);
      } else {
        return Math.floor(number);
      }
    }

    function convertSliceArgument(value, length) {
      if (value < 0) {
        return Math.max(value + length, 0);
      } else {
        return Math.min(value, length);
      }
    }
    Random.pick = function (engine, array, begin, end) {
      var length = array.length;
      var start = begin == null ? 0 : convertSliceArgument(toInteger(begin), length);
      var finish = end === void 0 ? length : convertSliceArgument(toInteger(end), length);
      if (start >= finish) {
        return void 0;
      }
      var distribution = Random.integer(start, finish - 1);
      return array[distribution(engine)];
    };
    proto.pick = function (array, begin, end) {
      return Random.pick(this.engine, array, begin, end);
    };

    function returnUndefined() {
      return void 0;
    }
    var slice = Array.prototype.slice;
    Random.picker = function (array, begin, end) {
      var clone = slice.call(array, begin, end);
      if (!clone.length) {
        return returnUndefined;
      }
      var distribution = Random.integer(0, clone.length - 1);
      return function (engine) {
        return clone[distribution(engine)];
      };
    };

    Random.shuffle = function (engine, array, downTo) {
      var length = array.length;
      if (length) {
        if (downTo == null) {
          downTo = 0;
        }
        for (var i = (length - 1) >>> 0; i > downTo; --i) {
          var distribution = Random.integer(0, i);
          var j = distribution(engine);
          if (i !== j) {
            var tmp = array[i];
            array[i] = array[j];
            array[j] = tmp;
          }
        }
      }
      return array;
    };
    proto.shuffle = function (array) {
      return Random.shuffle(this.engine, array);
    };

    Random.sample = function (engine, population, sampleSize) {
      if (sampleSize < 0 || sampleSize > population.length || !isFinite(sampleSize)) {
        throw new RangeError("Expected sampleSize to be within 0 and the length of the population");
      }

      if (sampleSize === 0) {
        return [];
      }

      var clone = slice.call(population);
      var length = clone.length;
      if (length === sampleSize) {
        return Random.shuffle(engine, clone, 0);
      }
      var tailLength = length - sampleSize;
      return Random.shuffle(engine, clone, tailLength - 1).slice(tailLength);
    };
    proto.sample = function (population, sampleSize) {
      return Random.sample(this.engine, population, sampleSize);
    };

    Random.die = function (sideCount) {
      return Random.integer(1, sideCount);
    };
    proto.die = function (sideCount) {
      return Random.die(sideCount)(this.engine);
    };

    Random.dice = function (sideCount, dieCount) {
      var distribution = Random.die(sideCount);
      return function (engine) {
        var result = [];
        result.length = dieCount;
        for (var i = 0; i < dieCount; ++i) {
          result[i] = distribution(engine);
        }
        return result;
      };
    };
    proto.dice = function (sideCount, dieCount) {
      return Random.dice(sideCount, dieCount)(this.engine);
    };

    // http://en.wikipedia.org/wiki/Universally_unique_identifier
    Random.uuid4 = (function () {
      function zeroPad(string, zeroCount) {
        return stringRepeat("0", zeroCount - string.length) + string;
      }

      return function (engine) {
        var a = engine() >>> 0;
        var b = engine() | 0;
        var c = engine() | 0;
        var d = engine() >>> 0;

        return (
          zeroPad(a.toString(16), 8) +
          "-" +
          zeroPad((b & 0xffff).toString(16), 4) +
          "-" +
          zeroPad((((b >> 4) & 0x0fff) | 0x4000).toString(16), 4) +
          "-" +
          zeroPad(((c & 0x3fff) | 0x8000).toString(16), 4) +
          "-" +
          zeroPad(((c >> 4) & 0xffff).toString(16), 4) +
          zeroPad(d.toString(16), 8));
      };
    }());
    proto.uuid4 = function () {
      return Random.uuid4(this.engine);
    };

    Random.string = (function () {
      // has 2**x chars, for faster uniform distribution
      var DEFAULT_STRING_POOL = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-";

      return function (pool) {
        if (pool == null) {
          pool = DEFAULT_STRING_POOL;
        }

        var length = pool.length;
        if (!length) {
          throw new Error("Expected pool not to be an empty string");
        }

        var distribution = Random.integer(0, length - 1);
        return function (engine, length) {
          var result = "";
          for (var i = 0; i < length; ++i) {
            var j = distribution(engine);
            result += pool.charAt(j);
          }
          return result;
        };
      };
    }());
    proto.string = function (length, pool) {
      return Random.string(pool)(this.engine, length);
    };

    Random.hex = (function () {
      var LOWER_HEX_POOL = "0123456789abcdef";
      var lowerHex = Random.string(LOWER_HEX_POOL);
      var upperHex = Random.string(LOWER_HEX_POOL.toUpperCase());

      return function (upper) {
        if (upper) {
          return upperHex;
        } else {
          return lowerHex;
        }
      };
    }());
    proto.hex = function (length, upper) {
      return Random.hex(upper)(this.engine, length);
    };

    Random.date = function (start, end) {
      if (!(start instanceof Date)) {
        throw new TypeError("Expected start to be a Date, got " + typeof start);
      } else if (!(end instanceof Date)) {
        throw new TypeError("Expected end to be a Date, got " + typeof end);
      }
      var distribution = Random.integer(start.getTime(), end.getTime());
      return function (engine) {
        return new Date(distribution(engine));
      };
    };
    proto.date = function (start, end) {
      return Random.date(start, end)(this.engine);
    };

    if (typeof undefined === "function" && undefined.amd) {
      undefined(function () {
        return Random;
      });
    } else if (typeof commonjsRequire === "function") {
      module.exports = Random;
    } else {
      (function () {
        var oldGlobal = root[GLOBAL_KEY];
        Random.noConflict = function () {
          root[GLOBAL_KEY] = oldGlobal;
          return this;
        };
      }());
      root[GLOBAL_KEY] = Random;
    }
  }(commonjsGlobal));
  });

  window.random = random();

  // Create a Databender instance
  var databend = function (audioCtx, config) {
    // Create an AudioContext or use existing one
    this.audioCtx = audioCtx ? audioCtx : new AudioContext();
    this.channels = 1; 

    this.convert = function (image) {
      if (image instanceof Image || image instanceof HTMLVideoElement) {
        var canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      }
      this.imageData = imageData || image;
      var bufferSize = this.imageData.data.length / this.channels;

      // Make an audioBuffer on the audioContext to pass to the offlineAudioCtx AudioBufferSourceNode
      var audioBuffer = this.audioCtx.createBuffer(this.channels, bufferSize, this.audioCtx.sampleRate); 

      // This gives us the actual ArrayBuffer that contains the data
      var nowBuffering = audioBuffer.getChannelData(0);

      nowBuffering.set(this.imageData.data);

      return Promise.resolve(audioBuffer);
    };

    this.render = function (buffer, effectsConfig, bypass = false) {
      this.previousEffectsConfig = this.previousEffectsConfig || JSON.parse(JSON.stringify(effectsConfig));

      const effectsIndex = Object.keys(effectsConfig);

      // Create offlineAudioCtx that will house our rendered buffer
      var offlineAudioCtx = new OfflineAudioContext(this.channels, buffer.length * this.channels, this.audioCtx.sampleRate);

      // Create an AudioBufferSourceNode, which represents an audio source consisting of in-memory audio data
      var bufferSource = offlineAudioCtx.createBufferSource();

      // Set buffer to audio buffer containing image data
      bufferSource.buffer = buffer; 

      if (this.previousEffectsConfig !== effectsConfig) {
        var activeEffects = effectsIndex.reduce((acc, cur) => {
          effectsConfig[cur].active ? acc[cur] = effects$1[cur] : false; 
          return acc;
        }, {});
        var activeEffectsIndex = Object.keys(activeEffects);
      }

      if (this.previousEffectsConfig !== effectsConfig && activeEffectsIndex && activeEffectsIndex.length) {
        activeEffectsIndex.forEach((effect) => {
          if (effect === 'detune' || effect === 'playbackRate') {
            return effects$1[effect](bufferSource, effectsConfig)
          }
        });
      }

      bufferSource.start();

      if (activeEffectsIndex && activeEffectsIndex.length) {
        var tuna$$1 = new tuna(offlineAudioCtx);

        var nodes = activeEffectsIndex.map((effect) => { 
          if (effect !== 'detune' && effect !== 'playbackRate') {
            if (effect === 'biquad') {
              return effects$1[effect](bufferSource, offlineAudioCtx, effectsConfig);
            } else {
              return effects$1[effect](tuna$$1, effectsConfig);
            }
          }
        }).filter(Boolean);
      }

      if (!nodes || nodes.length === 0 || bypass) {
        bufferSource.connect(offlineAudioCtx.destination);
      } else {
        nodes.forEach((node) => { 
          bufferSource.connect(node);
          node.connect(offlineAudioCtx.destination);
        });
      }

      this.previousEffectsConfig = JSON.parse(JSON.stringify(effectsConfig));
      // Kick off the render, callback will contain rendered buffer in event
      return offlineAudioCtx.startRendering();
    };

    this.draw = function (buffer, context, x = 0, y = 0) {

      // Get buffer data
      var bufferData = buffer.getChannelData(0);

      // ImageData expects a Uint8ClampedArray so we need to make a typed array from our buffer
      // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
      var clampedDataArray = new Uint8ClampedArray(buffer.length);

      // set the renderedBuffer to Uint8ClampedArray to use in ImageData later
      clampedDataArray.set(bufferData);

      // putImageData requires an ImageData Object
      // @see https://developer.mozilla.org/en-US/docs/Web/API/ImageData
      var transformedImage = new ImageData(clampedDataArray, this.imageData.width, this.imageData.height);

      context.putImageData(transformedImage, x, y);
    };

    this.bend = function (data, context, effectsConfig, x, y) { 
      return this.convert(data)
        .then((buffer) => this.render(buffer, effectsConfig))
        .then((buffer) => this.draw(buffer, context, x, y))
    };

    return this;
  };

  /**
   * dat-gui JavaScript Controller Library
   * http://code.google.com/p/dat-gui
   *
   * Copyright 2011 Data Arts Team, Google Creative Lab
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   */

  function ___$insertStyle(css) {
    if (!css) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }

    var style = document.createElement('style');

    style.setAttribute('type', 'text/css');
    style.innerHTML = css;
    document.head.appendChild(style);

    return css;
  }

  function colorToString (color, forceCSSHex) {
    var colorFormat = color.__state.conversionName.toString();
    var r = Math.round(color.r);
    var g = Math.round(color.g);
    var b = Math.round(color.b);
    var a = color.a;
    var h = Math.round(color.h);
    var s = color.s.toFixed(1);
    var v = color.v.toFixed(1);
    if (forceCSSHex || colorFormat === 'THREE_CHAR_HEX' || colorFormat === 'SIX_CHAR_HEX') {
      var str = color.hex.toString(16);
      while (str.length < 6) {
        str = '0' + str;
      }
      return '#' + str;
    } else if (colorFormat === 'CSS_RGB') {
      return 'rgb(' + r + ',' + g + ',' + b + ')';
    } else if (colorFormat === 'CSS_RGBA') {
      return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    } else if (colorFormat === 'HEX') {
      return '0x' + color.hex.toString(16);
    } else if (colorFormat === 'RGB_ARRAY') {
      return '[' + r + ',' + g + ',' + b + ']';
    } else if (colorFormat === 'RGBA_ARRAY') {
      return '[' + r + ',' + g + ',' + b + ',' + a + ']';
    } else if (colorFormat === 'RGB_OBJ') {
      return '{r:' + r + ',g:' + g + ',b:' + b + '}';
    } else if (colorFormat === 'RGBA_OBJ') {
      return '{r:' + r + ',g:' + g + ',b:' + b + ',a:' + a + '}';
    } else if (colorFormat === 'HSV_OBJ') {
      return '{h:' + h + ',s:' + s + ',v:' + v + '}';
    } else if (colorFormat === 'HSVA_OBJ') {
      return '{h:' + h + ',s:' + s + ',v:' + v + ',a:' + a + '}';
    }
    return 'unknown format';
  }

  var ARR_EACH = Array.prototype.forEach;
  var ARR_SLICE = Array.prototype.slice;
  var Common = {
    BREAK: {},
    extend: function extend(target) {
      this.each(ARR_SLICE.call(arguments, 1), function (obj) {
        var keys = this.isObject(obj) ? Object.keys(obj) : [];
        keys.forEach(function (key) {
          if (!this.isUndefined(obj[key])) {
            target[key] = obj[key];
          }
        }.bind(this));
      }, this);
      return target;
    },
    defaults: function defaults(target) {
      this.each(ARR_SLICE.call(arguments, 1), function (obj) {
        var keys = this.isObject(obj) ? Object.keys(obj) : [];
        keys.forEach(function (key) {
          if (this.isUndefined(target[key])) {
            target[key] = obj[key];
          }
        }.bind(this));
      }, this);
      return target;
    },
    compose: function compose() {
      var toCall = ARR_SLICE.call(arguments);
      return function () {
        var args = ARR_SLICE.call(arguments);
        for (var i = toCall.length - 1; i >= 0; i--) {
          args = [toCall[i].apply(this, args)];
        }
        return args[0];
      };
    },
    each: function each(obj, itr, scope) {
      if (!obj) {
        return;
      }
      if (ARR_EACH && obj.forEach && obj.forEach === ARR_EACH) {
        obj.forEach(itr, scope);
      } else if (obj.length === obj.length + 0) {
        var key = void 0;
        var l = void 0;
        for (key = 0, l = obj.length; key < l; key++) {
          if (key in obj && itr.call(scope, obj[key], key) === this.BREAK) {
            return;
          }
        }
      } else {
        for (var _key in obj) {
          if (itr.call(scope, obj[_key], _key) === this.BREAK) {
            return;
          }
        }
      }
    },
    defer: function defer(fnc) {
      setTimeout(fnc, 0);
    },
    debounce: function debounce(func, threshold, callImmediately) {
      var timeout = void 0;
      return function () {
        var obj = this;
        var args = arguments;
        function delayed() {
          timeout = null;
          if (!callImmediately) func.apply(obj, args);
        }
        var callNow = callImmediately || !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(delayed, threshold);
        if (callNow) {
          func.apply(obj, args);
        }
      };
    },
    toArray: function toArray(obj) {
      if (obj.toArray) return obj.toArray();
      return ARR_SLICE.call(obj);
    },
    isUndefined: function isUndefined(obj) {
      return obj === undefined;
    },
    isNull: function isNull(obj) {
      return obj === null;
    },
    isNaN: function (_isNaN) {
      function isNaN(_x) {
        return _isNaN.apply(this, arguments);
      }
      isNaN.toString = function () {
        return _isNaN.toString();
      };
      return isNaN;
    }(function (obj) {
      return isNaN(obj);
    }),
    isArray: Array.isArray || function (obj) {
      return obj.constructor === Array;
    },
    isObject: function isObject(obj) {
      return obj === Object(obj);
    },
    isNumber: function isNumber(obj) {
      return obj === obj + 0;
    },
    isString: function isString(obj) {
      return obj === obj + '';
    },
    isBoolean: function isBoolean(obj) {
      return obj === false || obj === true;
    },
    isFunction: function isFunction(obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  };

  var INTERPRETATIONS = [
  {
    litmus: Common.isString,
    conversions: {
      THREE_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9])([A-F0-9])([A-F0-9])$/i);
          if (test === null) {
            return false;
          }
          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString() + test[1].toString() + test[2].toString() + test[2].toString() + test[3].toString() + test[3].toString(), 0)
          };
        },
        write: colorToString
      },
      SIX_CHAR_HEX: {
        read: function read(original) {
          var test = original.match(/^#([A-F0-9]{6})$/i);
          if (test === null) {
            return false;
          }
          return {
            space: 'HEX',
            hex: parseInt('0x' + test[1].toString(), 0)
          };
        },
        write: colorToString
      },
      CSS_RGB: {
        read: function read(original) {
          var test = original.match(/^rgb\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3])
          };
        },
        write: colorToString
      },
      CSS_RGBA: {
        read: function read(original) {
          var test = original.match(/^rgba\(\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*,\s*(.+)\s*\)/);
          if (test === null) {
            return false;
          }
          return {
            space: 'RGB',
            r: parseFloat(test[1]),
            g: parseFloat(test[2]),
            b: parseFloat(test[3]),
            a: parseFloat(test[4])
          };
        },
        write: colorToString
      }
    }
  },
  {
    litmus: Common.isNumber,
    conversions: {
      HEX: {
        read: function read(original) {
          return {
            space: 'HEX',
            hex: original,
            conversionName: 'HEX'
          };
        },
        write: function write(color) {
          return color.hex;
        }
      }
    }
  },
  {
    litmus: Common.isArray,
    conversions: {
      RGB_ARRAY: {
        read: function read(original) {
          if (original.length !== 3) {
            return false;
          }
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2]
          };
        },
        write: function write(color) {
          return [color.r, color.g, color.b];
        }
      },
      RGBA_ARRAY: {
        read: function read(original) {
          if (original.length !== 4) return false;
          return {
            space: 'RGB',
            r: original[0],
            g: original[1],
            b: original[2],
            a: original[3]
          };
        },
        write: function write(color) {
          return [color.r, color.g, color.b, color.a];
        }
      }
    }
  },
  {
    litmus: Common.isObject,
    conversions: {
      RGBA_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b) && Common.isNumber(original.a)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b,
              a: original.a
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b,
            a: color.a
          };
        }
      },
      RGB_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.r) && Common.isNumber(original.g) && Common.isNumber(original.b)) {
            return {
              space: 'RGB',
              r: original.r,
              g: original.g,
              b: original.b
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            r: color.r,
            g: color.g,
            b: color.b
          };
        }
      },
      HSVA_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v) && Common.isNumber(original.a)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v,
              a: original.a
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v,
            a: color.a
          };
        }
      },
      HSV_OBJ: {
        read: function read(original) {
          if (Common.isNumber(original.h) && Common.isNumber(original.s) && Common.isNumber(original.v)) {
            return {
              space: 'HSV',
              h: original.h,
              s: original.s,
              v: original.v
            };
          }
          return false;
        },
        write: function write(color) {
          return {
            h: color.h,
            s: color.s,
            v: color.v
          };
        }
      }
    }
  }];
  var result = void 0;
  var toReturn = void 0;
  var interpret = function interpret() {
    toReturn = false;
    var original = arguments.length > 1 ? Common.toArray(arguments) : arguments[0];
    Common.each(INTERPRETATIONS, function (family) {
      if (family.litmus(original)) {
        Common.each(family.conversions, function (conversion, conversionName) {
          result = conversion.read(original);
          if (toReturn === false && result !== false) {
            toReturn = result;
            result.conversionName = conversionName;
            result.conversion = conversion;
            return Common.BREAK;
          }
        });
        return Common.BREAK;
      }
    });
    return toReturn;
  };

  var tmpComponent = void 0;
  var ColorMath = {
    hsv_to_rgb: function hsv_to_rgb(h, s, v) {
      var hi = Math.floor(h / 60) % 6;
      var f = h / 60 - Math.floor(h / 60);
      var p = v * (1.0 - s);
      var q = v * (1.0 - f * s);
      var t = v * (1.0 - (1.0 - f) * s);
      var c = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][hi];
      return {
        r: c[0] * 255,
        g: c[1] * 255,
        b: c[2] * 255
      };
    },
    rgb_to_hsv: function rgb_to_hsv(r, g, b) {
      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;
      var h = void 0;
      var s = void 0;
      if (max !== 0) {
        s = delta / max;
      } else {
        return {
          h: NaN,
          s: 0,
          v: 0
        };
      }
      if (r === max) {
        h = (g - b) / delta;
      } else if (g === max) {
        h = 2 + (b - r) / delta;
      } else {
        h = 4 + (r - g) / delta;
      }
      h /= 6;
      if (h < 0) {
        h += 1;
      }
      return {
        h: h * 360,
        s: s,
        v: max / 255
      };
    },
    rgb_to_hex: function rgb_to_hex(r, g, b) {
      var hex = this.hex_with_component(0, 2, r);
      hex = this.hex_with_component(hex, 1, g);
      hex = this.hex_with_component(hex, 0, b);
      return hex;
    },
    component_from_hex: function component_from_hex(hex, componentIndex) {
      return hex >> componentIndex * 8 & 0xFF;
    },
    hex_with_component: function hex_with_component(hex, componentIndex, value) {
      return value << (tmpComponent = componentIndex * 8) | hex & ~(0xFF << tmpComponent);
    }
  };

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };











  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();







  var get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };











  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var Color = function () {
    function Color() {
      classCallCheck(this, Color);
      this.__state = interpret.apply(this, arguments);
      if (this.__state === false) {
        throw new Error('Failed to interpret color arguments');
      }
      this.__state.a = this.__state.a || 1;
    }
    createClass(Color, [{
      key: 'toString',
      value: function toString() {
        return colorToString(this);
      }
    }, {
      key: 'toHexString',
      value: function toHexString() {
        return colorToString(this, true);
      }
    }, {
      key: 'toOriginal',
      value: function toOriginal() {
        return this.__state.conversion.write(this);
      }
    }]);
    return Color;
  }();
  function defineRGBComponent(target, component, componentHexIndex) {
    Object.defineProperty(target, component, {
      get: function get$$1() {
        if (this.__state.space === 'RGB') {
          return this.__state[component];
        }
        Color.recalculateRGB(this, component, componentHexIndex);
        return this.__state[component];
      },
      set: function set$$1(v) {
        if (this.__state.space !== 'RGB') {
          Color.recalculateRGB(this, component, componentHexIndex);
          this.__state.space = 'RGB';
        }
        this.__state[component] = v;
      }
    });
  }
  function defineHSVComponent(target, component) {
    Object.defineProperty(target, component, {
      get: function get$$1() {
        if (this.__state.space === 'HSV') {
          return this.__state[component];
        }
        Color.recalculateHSV(this);
        return this.__state[component];
      },
      set: function set$$1(v) {
        if (this.__state.space !== 'HSV') {
          Color.recalculateHSV(this);
          this.__state.space = 'HSV';
        }
        this.__state[component] = v;
      }
    });
  }
  Color.recalculateRGB = function (color, component, componentHexIndex) {
    if (color.__state.space === 'HEX') {
      color.__state[component] = ColorMath.component_from_hex(color.__state.hex, componentHexIndex);
    } else if (color.__state.space === 'HSV') {
      Common.extend(color.__state, ColorMath.hsv_to_rgb(color.__state.h, color.__state.s, color.__state.v));
    } else {
      throw new Error('Corrupted color state');
    }
  };
  Color.recalculateHSV = function (color) {
    var result = ColorMath.rgb_to_hsv(color.r, color.g, color.b);
    Common.extend(color.__state, {
      s: result.s,
      v: result.v
    });
    if (!Common.isNaN(result.h)) {
      color.__state.h = result.h;
    } else if (Common.isUndefined(color.__state.h)) {
      color.__state.h = 0;
    }
  };
  Color.COMPONENTS = ['r', 'g', 'b', 'h', 's', 'v', 'hex', 'a'];
  defineRGBComponent(Color.prototype, 'r', 2);
  defineRGBComponent(Color.prototype, 'g', 1);
  defineRGBComponent(Color.prototype, 'b', 0);
  defineHSVComponent(Color.prototype, 'h');
  defineHSVComponent(Color.prototype, 's');
  defineHSVComponent(Color.prototype, 'v');
  Object.defineProperty(Color.prototype, 'a', {
    get: function get$$1() {
      return this.__state.a;
    },
    set: function set$$1(v) {
      this.__state.a = v;
    }
  });
  Object.defineProperty(Color.prototype, 'hex', {
    get: function get$$1() {
      if (!this.__state.space !== 'HEX') {
        this.__state.hex = ColorMath.rgb_to_hex(this.r, this.g, this.b);
      }
      return this.__state.hex;
    },
    set: function set$$1(v) {
      this.__state.space = 'HEX';
      this.__state.hex = v;
    }
  });

  var Controller = function () {
    function Controller(object, property) {
      classCallCheck(this, Controller);
      this.initialValue = object[property];
      this.domElement = document.createElement('div');
      this.object = object;
      this.property = property;
      this.__onChange = undefined;
      this.__onFinishChange = undefined;
    }
    createClass(Controller, [{
      key: 'onChange',
      value: function onChange(fnc) {
        this.__onChange = fnc;
        return this;
      }
    }, {
      key: 'onFinishChange',
      value: function onFinishChange(fnc) {
        this.__onFinishChange = fnc;
        return this;
      }
    }, {
      key: 'setValue',
      value: function setValue(newValue) {
        this.object[this.property] = newValue;
        if (this.__onChange) {
          this.__onChange.call(this, newValue);
        }
        this.updateDisplay();
        return this;
      }
    }, {
      key: 'getValue',
      value: function getValue() {
        return this.object[this.property];
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        return this;
      }
    }, {
      key: 'isModified',
      value: function isModified() {
        return this.initialValue !== this.getValue();
      }
    }]);
    return Controller;
  }();

  var EVENT_MAP = {
    HTMLEvents: ['change'],
    MouseEvents: ['click', 'mousemove', 'mousedown', 'mouseup', 'mouseover'],
    KeyboardEvents: ['keydown']
  };
  var EVENT_MAP_INV = {};
  Common.each(EVENT_MAP, function (v, k) {
    Common.each(v, function (e) {
      EVENT_MAP_INV[e] = k;
    });
  });
  var CSS_VALUE_PIXELS = /(\d+(\.\d+)?)px/;
  function cssValueToPixels(val) {
    if (val === '0' || Common.isUndefined(val)) {
      return 0;
    }
    var match = val.match(CSS_VALUE_PIXELS);
    if (!Common.isNull(match)) {
      return parseFloat(match[1]);
    }
    return 0;
  }
  var dom = {
    makeSelectable: function makeSelectable(elem, selectable) {
      if (elem === undefined || elem.style === undefined) return;
      elem.onselectstart = selectable ? function () {
        return false;
      } : function () {};
      elem.style.MozUserSelect = selectable ? 'auto' : 'none';
      elem.style.KhtmlUserSelect = selectable ? 'auto' : 'none';
      elem.unselectable = selectable ? 'on' : 'off';
    },
    makeFullscreen: function makeFullscreen(elem, hor, vert) {
      var vertical = vert;
      var horizontal = hor;
      if (Common.isUndefined(horizontal)) {
        horizontal = true;
      }
      if (Common.isUndefined(vertical)) {
        vertical = true;
      }
      elem.style.position = 'absolute';
      if (horizontal) {
        elem.style.left = 0;
        elem.style.right = 0;
      }
      if (vertical) {
        elem.style.top = 0;
        elem.style.bottom = 0;
      }
    },
    fakeEvent: function fakeEvent(elem, eventType, pars, aux) {
      var params = pars || {};
      var className = EVENT_MAP_INV[eventType];
      if (!className) {
        throw new Error('Event type ' + eventType + ' not supported.');
      }
      var evt = document.createEvent(className);
      switch (className) {
        case 'MouseEvents':
          {
            var clientX = params.x || params.clientX || 0;
            var clientY = params.y || params.clientY || 0;
            evt.initMouseEvent(eventType, params.bubbles || false, params.cancelable || true, window, params.clickCount || 1, 0,
            0,
            clientX,
            clientY,
            false, false, false, false, 0, null);
            break;
          }
        case 'KeyboardEvents':
          {
            var init = evt.initKeyboardEvent || evt.initKeyEvent;
            Common.defaults(params, {
              cancelable: true,
              ctrlKey: false,
              altKey: false,
              shiftKey: false,
              metaKey: false,
              keyCode: undefined,
              charCode: undefined
            });
            init(eventType, params.bubbles || false, params.cancelable, window, params.ctrlKey, params.altKey, params.shiftKey, params.metaKey, params.keyCode, params.charCode);
            break;
          }
        default:
          {
            evt.initEvent(eventType, params.bubbles || false, params.cancelable || true);
            break;
          }
      }
      Common.defaults(evt, aux);
      elem.dispatchEvent(evt);
    },
    bind: function bind(elem, event, func, newBool) {
      var bool = newBool || false;
      if (elem.addEventListener) {
        elem.addEventListener(event, func, bool);
      } else if (elem.attachEvent) {
        elem.attachEvent('on' + event, func);
      }
      return dom;
    },
    unbind: function unbind(elem, event, func, newBool) {
      var bool = newBool || false;
      if (elem.removeEventListener) {
        elem.removeEventListener(event, func, bool);
      } else if (elem.detachEvent) {
        elem.detachEvent('on' + event, func);
      }
      return dom;
    },
    addClass: function addClass(elem, className) {
      if (elem.className === undefined) {
        elem.className = className;
      } else if (elem.className !== className) {
        var classes = elem.className.split(/ +/);
        if (classes.indexOf(className) === -1) {
          classes.push(className);
          elem.className = classes.join(' ').replace(/^\s+/, '').replace(/\s+$/, '');
        }
      }
      return dom;
    },
    removeClass: function removeClass(elem, className) {
      if (className) {
        if (elem.className === className) {
          elem.removeAttribute('class');
        } else {
          var classes = elem.className.split(/ +/);
          var index = classes.indexOf(className);
          if (index !== -1) {
            classes.splice(index, 1);
            elem.className = classes.join(' ');
          }
        }
      } else {
        elem.className = undefined;
      }
      return dom;
    },
    hasClass: function hasClass(elem, className) {
      return new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)').test(elem.className) || false;
    },
    getWidth: function getWidth(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style['border-left-width']) + cssValueToPixels(style['border-right-width']) + cssValueToPixels(style['padding-left']) + cssValueToPixels(style['padding-right']) + cssValueToPixels(style.width);
    },
    getHeight: function getHeight(elem) {
      var style = getComputedStyle(elem);
      return cssValueToPixels(style['border-top-width']) + cssValueToPixels(style['border-bottom-width']) + cssValueToPixels(style['padding-top']) + cssValueToPixels(style['padding-bottom']) + cssValueToPixels(style.height);
    },
    getOffset: function getOffset(el) {
      var elem = el;
      var offset = { left: 0, top: 0 };
      if (elem.offsetParent) {
        do {
          offset.left += elem.offsetLeft;
          offset.top += elem.offsetTop;
          elem = elem.offsetParent;
        } while (elem);
      }
      return offset;
    },
    isActive: function isActive(elem) {
      return elem === document.activeElement && (elem.type || elem.href);
    }
  };

  var BooleanController = function (_Controller) {
    inherits(BooleanController, _Controller);
    function BooleanController(object, property) {
      classCallCheck(this, BooleanController);
      var _this2 = possibleConstructorReturn(this, (BooleanController.__proto__ || Object.getPrototypeOf(BooleanController)).call(this, object, property));
      var _this = _this2;
      _this2.__prev = _this2.getValue();
      _this2.__checkbox = document.createElement('input');
      _this2.__checkbox.setAttribute('type', 'checkbox');
      function onChange() {
        _this.setValue(!_this.__prev);
      }
      dom.bind(_this2.__checkbox, 'change', onChange, false);
      _this2.domElement.appendChild(_this2.__checkbox);
      _this2.updateDisplay();
      return _this2;
    }
    createClass(BooleanController, [{
      key: 'setValue',
      value: function setValue(v) {
        var toReturn = get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'setValue', this).call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        this.__prev = this.getValue();
        return toReturn;
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (this.getValue() === true) {
          this.__checkbox.setAttribute('checked', 'checked');
          this.__checkbox.checked = true;
          this.__prev = true;
        } else {
          this.__checkbox.checked = false;
          this.__prev = false;
        }
        return get(BooleanController.prototype.__proto__ || Object.getPrototypeOf(BooleanController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return BooleanController;
  }(Controller);

  var OptionController = function (_Controller) {
    inherits(OptionController, _Controller);
    function OptionController(object, property, opts) {
      classCallCheck(this, OptionController);
      var _this2 = possibleConstructorReturn(this, (OptionController.__proto__ || Object.getPrototypeOf(OptionController)).call(this, object, property));
      var options = opts;
      var _this = _this2;
      _this2.__select = document.createElement('select');
      if (Common.isArray(options)) {
        var map = {};
        Common.each(options, function (element) {
          map[element] = element;
        });
        options = map;
      }
      Common.each(options, function (value, key) {
        var opt = document.createElement('option');
        opt.innerHTML = key;
        opt.setAttribute('value', value);
        _this.__select.appendChild(opt);
      });
      _this2.updateDisplay();
      dom.bind(_this2.__select, 'change', function () {
        var desiredValue = this.options[this.selectedIndex].value;
        _this.setValue(desiredValue);
      });
      _this2.domElement.appendChild(_this2.__select);
      return _this2;
    }
    createClass(OptionController, [{
      key: 'setValue',
      value: function setValue(v) {
        var toReturn = get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'setValue', this).call(this, v);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
        return toReturn;
      }
    }, {
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (dom.isActive(this.__select)) return this;
        this.__select.value = this.getValue();
        return get(OptionController.prototype.__proto__ || Object.getPrototypeOf(OptionController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return OptionController;
  }(Controller);

  var StringController = function (_Controller) {
    inherits(StringController, _Controller);
    function StringController(object, property) {
      classCallCheck(this, StringController);
      var _this2 = possibleConstructorReturn(this, (StringController.__proto__ || Object.getPrototypeOf(StringController)).call(this, object, property));
      var _this = _this2;
      function onChange() {
        _this.setValue(_this.__input.value);
      }
      function onBlur() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      _this2.__input = document.createElement('input');
      _this2.__input.setAttribute('type', 'text');
      dom.bind(_this2.__input, 'keyup', onChange);
      dom.bind(_this2.__input, 'change', onChange);
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          this.blur();
        }
      });
      _this2.updateDisplay();
      _this2.domElement.appendChild(_this2.__input);
      return _this2;
    }
    createClass(StringController, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        if (!dom.isActive(this.__input)) {
          this.__input.value = this.getValue();
        }
        return get(StringController.prototype.__proto__ || Object.getPrototypeOf(StringController.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return StringController;
  }(Controller);

  function numDecimals(x) {
    var _x = x.toString();
    if (_x.indexOf('.') > -1) {
      return _x.length - _x.indexOf('.') - 1;
    }
    return 0;
  }
  var NumberController = function (_Controller) {
    inherits(NumberController, _Controller);
    function NumberController(object, property, params) {
      classCallCheck(this, NumberController);
      var _this = possibleConstructorReturn(this, (NumberController.__proto__ || Object.getPrototypeOf(NumberController)).call(this, object, property));
      var _params = params || {};
      _this.__min = _params.min;
      _this.__max = _params.max;
      _this.__step = _params.step;
      if (Common.isUndefined(_this.__step)) {
        if (_this.initialValue === 0) {
          _this.__impliedStep = 1;
        } else {
          _this.__impliedStep = Math.pow(10, Math.floor(Math.log(Math.abs(_this.initialValue)) / Math.LN10)) / 10;
        }
      } else {
        _this.__impliedStep = _this.__step;
      }
      _this.__precision = numDecimals(_this.__impliedStep);
      return _this;
    }
    createClass(NumberController, [{
      key: 'setValue',
      value: function setValue(v) {
        var _v = v;
        if (this.__min !== undefined && _v < this.__min) {
          _v = this.__min;
        } else if (this.__max !== undefined && _v > this.__max) {
          _v = this.__max;
        }
        if (this.__step !== undefined && _v % this.__step !== 0) {
          _v = Math.round(_v / this.__step) * this.__step;
        }
        return get(NumberController.prototype.__proto__ || Object.getPrototypeOf(NumberController.prototype), 'setValue', this).call(this, _v);
      }
    }, {
      key: 'min',
      value: function min(minValue) {
        this.__min = minValue;
        return this;
      }
    }, {
      key: 'max',
      value: function max(maxValue) {
        this.__max = maxValue;
        return this;
      }
    }, {
      key: 'step',
      value: function step(stepValue) {
        this.__step = stepValue;
        this.__impliedStep = stepValue;
        this.__precision = numDecimals(stepValue);
        return this;
      }
    }]);
    return NumberController;
  }(Controller);

  function roundToDecimal(value, decimals) {
    var tenTo = Math.pow(10, decimals);
    return Math.round(value * tenTo) / tenTo;
  }
  var NumberControllerBox = function (_NumberController) {
    inherits(NumberControllerBox, _NumberController);
    function NumberControllerBox(object, property, params) {
      classCallCheck(this, NumberControllerBox);
      var _this2 = possibleConstructorReturn(this, (NumberControllerBox.__proto__ || Object.getPrototypeOf(NumberControllerBox)).call(this, object, property, params));
      _this2.__truncationSuspended = false;
      var _this = _this2;
      var prevY = void 0;
      function onChange() {
        var attempted = parseFloat(_this.__input.value);
        if (!Common.isNaN(attempted)) {
          _this.setValue(attempted);
        }
      }
      function onFinish() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      function onBlur() {
        onFinish();
      }
      function onMouseDrag(e) {
        var diff = prevY - e.clientY;
        _this.setValue(_this.getValue() + diff * _this.__impliedStep);
        prevY = e.clientY;
      }
      function onMouseUp() {
        dom.unbind(window, 'mousemove', onMouseDrag);
        dom.unbind(window, 'mouseup', onMouseUp);
        onFinish();
      }
      function onMouseDown(e) {
        dom.bind(window, 'mousemove', onMouseDrag);
        dom.bind(window, 'mouseup', onMouseUp);
        prevY = e.clientY;
      }
      _this2.__input = document.createElement('input');
      _this2.__input.setAttribute('type', 'text');
      dom.bind(_this2.__input, 'change', onChange);
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__input, 'mousedown', onMouseDown);
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          _this.__truncationSuspended = true;
          this.blur();
          _this.__truncationSuspended = false;
          onFinish();
        }
      });
      _this2.updateDisplay();
      _this2.domElement.appendChild(_this2.__input);
      return _this2;
    }
    createClass(NumberControllerBox, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        this.__input.value = this.__truncationSuspended ? this.getValue() : roundToDecimal(this.getValue(), this.__precision);
        return get(NumberControllerBox.prototype.__proto__ || Object.getPrototypeOf(NumberControllerBox.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return NumberControllerBox;
  }(NumberController);

  function map(v, i1, i2, o1, o2) {
    return o1 + (o2 - o1) * ((v - i1) / (i2 - i1));
  }
  var NumberControllerSlider = function (_NumberController) {
    inherits(NumberControllerSlider, _NumberController);
    function NumberControllerSlider(object, property, min, max, step) {
      classCallCheck(this, NumberControllerSlider);
      var _this2 = possibleConstructorReturn(this, (NumberControllerSlider.__proto__ || Object.getPrototypeOf(NumberControllerSlider)).call(this, object, property, { min: min, max: max, step: step }));
      var _this = _this2;
      _this2.__background = document.createElement('div');
      _this2.__foreground = document.createElement('div');
      dom.bind(_this2.__background, 'mousedown', onMouseDown);
      dom.bind(_this2.__background, 'touchstart', onTouchStart);
      dom.addClass(_this2.__background, 'slider');
      dom.addClass(_this2.__foreground, 'slider-fg');
      function onMouseDown(e) {
        document.activeElement.blur();
        dom.bind(window, 'mousemove', onMouseDrag);
        dom.bind(window, 'mouseup', onMouseUp);
        onMouseDrag(e);
      }
      function onMouseDrag(e) {
        e.preventDefault();
        var bgRect = _this.__background.getBoundingClientRect();
        _this.setValue(map(e.clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
        return false;
      }
      function onMouseUp() {
        dom.unbind(window, 'mousemove', onMouseDrag);
        dom.unbind(window, 'mouseup', onMouseUp);
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      function onTouchStart(e) {
        if (e.touches.length !== 1) {
          return;
        }
        dom.bind(window, 'touchmove', onTouchMove);
        dom.bind(window, 'touchend', onTouchEnd);
        onTouchMove(e);
      }
      function onTouchMove(e) {
        var clientX = e.touches[0].clientX;
        var bgRect = _this.__background.getBoundingClientRect();
        _this.setValue(map(clientX, bgRect.left, bgRect.right, _this.__min, _this.__max));
      }
      function onTouchEnd() {
        dom.unbind(window, 'touchmove', onTouchMove);
        dom.unbind(window, 'touchend', onTouchEnd);
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.getValue());
        }
      }
      _this2.updateDisplay();
      _this2.__background.appendChild(_this2.__foreground);
      _this2.domElement.appendChild(_this2.__background);
      return _this2;
    }
    createClass(NumberControllerSlider, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        var pct = (this.getValue() - this.__min) / (this.__max - this.__min);
        this.__foreground.style.width = pct * 100 + '%';
        return get(NumberControllerSlider.prototype.__proto__ || Object.getPrototypeOf(NumberControllerSlider.prototype), 'updateDisplay', this).call(this);
      }
    }]);
    return NumberControllerSlider;
  }(NumberController);

  var FunctionController = function (_Controller) {
    inherits(FunctionController, _Controller);
    function FunctionController(object, property, text) {
      classCallCheck(this, FunctionController);
      var _this2 = possibleConstructorReturn(this, (FunctionController.__proto__ || Object.getPrototypeOf(FunctionController)).call(this, object, property));
      var _this = _this2;
      _this2.__button = document.createElement('div');
      _this2.__button.innerHTML = text === undefined ? 'Fire' : text;
      dom.bind(_this2.__button, 'click', function (e) {
        e.preventDefault();
        _this.fire();
        return false;
      });
      dom.addClass(_this2.__button, 'button');
      _this2.domElement.appendChild(_this2.__button);
      return _this2;
    }
    createClass(FunctionController, [{
      key: 'fire',
      value: function fire() {
        if (this.__onChange) {
          this.__onChange.call(this);
        }
        this.getValue().call(this.object);
        if (this.__onFinishChange) {
          this.__onFinishChange.call(this, this.getValue());
        }
      }
    }]);
    return FunctionController;
  }(Controller);

  var ColorController = function (_Controller) {
    inherits(ColorController, _Controller);
    function ColorController(object, property) {
      classCallCheck(this, ColorController);
      var _this2 = possibleConstructorReturn(this, (ColorController.__proto__ || Object.getPrototypeOf(ColorController)).call(this, object, property));
      _this2.__color = new Color(_this2.getValue());
      _this2.__temp = new Color(0);
      var _this = _this2;
      _this2.domElement = document.createElement('div');
      dom.makeSelectable(_this2.domElement, false);
      _this2.__selector = document.createElement('div');
      _this2.__selector.className = 'selector';
      _this2.__saturation_field = document.createElement('div');
      _this2.__saturation_field.className = 'saturation-field';
      _this2.__field_knob = document.createElement('div');
      _this2.__field_knob.className = 'field-knob';
      _this2.__field_knob_border = '2px solid ';
      _this2.__hue_knob = document.createElement('div');
      _this2.__hue_knob.className = 'hue-knob';
      _this2.__hue_field = document.createElement('div');
      _this2.__hue_field.className = 'hue-field';
      _this2.__input = document.createElement('input');
      _this2.__input.type = 'text';
      _this2.__input_textShadow = '0 1px 1px ';
      dom.bind(_this2.__input, 'keydown', function (e) {
        if (e.keyCode === 13) {
          onBlur.call(this);
        }
      });
      dom.bind(_this2.__input, 'blur', onBlur);
      dom.bind(_this2.__selector, 'mousedown', function ()        {
        dom.addClass(this, 'drag').bind(window, 'mouseup', function ()        {
          dom.removeClass(_this.__selector, 'drag');
        });
      });
      dom.bind(_this2.__selector, 'touchstart', function ()        {
        dom.addClass(this, 'drag').bind(window, 'touchend', function ()        {
          dom.removeClass(_this.__selector, 'drag');
        });
      });
      var valueField = document.createElement('div');
      Common.extend(_this2.__selector.style, {
        width: '122px',
        height: '102px',
        padding: '3px',
        backgroundColor: '#222',
        boxShadow: '0px 1px 3px rgba(0,0,0,0.3)'
      });
      Common.extend(_this2.__field_knob.style, {
        position: 'absolute',
        width: '12px',
        height: '12px',
        border: _this2.__field_knob_border + (_this2.__color.v < 0.5 ? '#fff' : '#000'),
        boxShadow: '0px 1px 3px rgba(0,0,0,0.5)',
        borderRadius: '12px',
        zIndex: 1
      });
      Common.extend(_this2.__hue_knob.style, {
        position: 'absolute',
        width: '15px',
        height: '2px',
        borderRight: '4px solid #fff',
        zIndex: 1
      });
      Common.extend(_this2.__saturation_field.style, {
        width: '100px',
        height: '100px',
        border: '1px solid #555',
        marginRight: '3px',
        display: 'inline-block',
        cursor: 'pointer'
      });
      Common.extend(valueField.style, {
        width: '100%',
        height: '100%',
        background: 'none'
      });
      linearGradient(valueField, 'top', 'rgba(0,0,0,0)', '#000');
      Common.extend(_this2.__hue_field.style, {
        width: '15px',
        height: '100px',
        border: '1px solid #555',
        cursor: 'ns-resize',
        position: 'absolute',
        top: '3px',
        right: '3px'
      });
      hueGradient(_this2.__hue_field);
      Common.extend(_this2.__input.style, {
        outline: 'none',
        textAlign: 'center',
        color: '#fff',
        border: 0,
        fontWeight: 'bold',
        textShadow: _this2.__input_textShadow + 'rgba(0,0,0,0.7)'
      });
      dom.bind(_this2.__saturation_field, 'mousedown', fieldDown);
      dom.bind(_this2.__saturation_field, 'touchstart', fieldDown);
      dom.bind(_this2.__field_knob, 'mousedown', fieldDown);
      dom.bind(_this2.__field_knob, 'touchstart', fieldDown);
      dom.bind(_this2.__hue_field, 'mousedown', fieldDownH);
      dom.bind(_this2.__hue_field, 'touchstart', fieldDownH);
      function fieldDown(e) {
        setSV(e);
        dom.bind(window, 'mousemove', setSV);
        dom.bind(window, 'touchmove', setSV);
        dom.bind(window, 'mouseup', fieldUpSV);
        dom.bind(window, 'touchend', fieldUpSV);
      }
      function fieldDownH(e) {
        setH(e);
        dom.bind(window, 'mousemove', setH);
        dom.bind(window, 'touchmove', setH);
        dom.bind(window, 'mouseup', fieldUpH);
        dom.bind(window, 'touchend', fieldUpH);
      }
      function fieldUpSV() {
        dom.unbind(window, 'mousemove', setSV);
        dom.unbind(window, 'touchmove', setSV);
        dom.unbind(window, 'mouseup', fieldUpSV);
        dom.unbind(window, 'touchend', fieldUpSV);
        onFinish();
      }
      function fieldUpH() {
        dom.unbind(window, 'mousemove', setH);
        dom.unbind(window, 'touchmove', setH);
        dom.unbind(window, 'mouseup', fieldUpH);
        dom.unbind(window, 'touchend', fieldUpH);
        onFinish();
      }
      function onBlur() {
        var i = interpret(this.value);
        if (i !== false) {
          _this.__color.__state = i;
          _this.setValue(_this.__color.toOriginal());
        } else {
          this.value = _this.__color.toString();
        }
      }
      function onFinish() {
        if (_this.__onFinishChange) {
          _this.__onFinishChange.call(_this, _this.__color.toOriginal());
        }
      }
      _this2.__saturation_field.appendChild(valueField);
      _this2.__selector.appendChild(_this2.__field_knob);
      _this2.__selector.appendChild(_this2.__saturation_field);
      _this2.__selector.appendChild(_this2.__hue_field);
      _this2.__hue_field.appendChild(_this2.__hue_knob);
      _this2.domElement.appendChild(_this2.__input);
      _this2.domElement.appendChild(_this2.__selector);
      _this2.updateDisplay();
      function setSV(e) {
        if (e.type.indexOf('touch') === -1) {
          e.preventDefault();
        }
        var fieldRect = _this.__saturation_field.getBoundingClientRect();
        var _ref = e.touches && e.touches[0] || e,
            clientX = _ref.clientX,
            clientY = _ref.clientY;
        var s = (clientX - fieldRect.left) / (fieldRect.right - fieldRect.left);
        var v = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
        if (v > 1) {
          v = 1;
        } else if (v < 0) {
          v = 0;
        }
        if (s > 1) {
          s = 1;
        } else if (s < 0) {
          s = 0;
        }
        _this.__color.v = v;
        _this.__color.s = s;
        _this.setValue(_this.__color.toOriginal());
        return false;
      }
      function setH(e) {
        if (e.type.indexOf('touch') === -1) {
          e.preventDefault();
        }
        var fieldRect = _this.__hue_field.getBoundingClientRect();
        var _ref2 = e.touches && e.touches[0] || e,
            clientY = _ref2.clientY;
        var h = 1 - (clientY - fieldRect.top) / (fieldRect.bottom - fieldRect.top);
        if (h > 1) {
          h = 1;
        } else if (h < 0) {
          h = 0;
        }
        _this.__color.h = h * 360;
        _this.setValue(_this.__color.toOriginal());
        return false;
      }
      return _this2;
    }
    createClass(ColorController, [{
      key: 'updateDisplay',
      value: function updateDisplay() {
        var i = interpret(this.getValue());
        if (i !== false) {
          var mismatch = false;
          Common.each(Color.COMPONENTS, function (component) {
            if (!Common.isUndefined(i[component]) && !Common.isUndefined(this.__color.__state[component]) && i[component] !== this.__color.__state[component]) {
              mismatch = true;
              return {};
            }
          }, this);
          if (mismatch) {
            Common.extend(this.__color.__state, i);
          }
        }
        Common.extend(this.__temp.__state, this.__color.__state);
        this.__temp.a = 1;
        var flip = this.__color.v < 0.5 || this.__color.s > 0.5 ? 255 : 0;
        var _flip = 255 - flip;
        Common.extend(this.__field_knob.style, {
          marginLeft: 100 * this.__color.s - 7 + 'px',
          marginTop: 100 * (1 - this.__color.v) - 7 + 'px',
          backgroundColor: this.__temp.toHexString(),
          border: this.__field_knob_border + 'rgb(' + flip + ',' + flip + ',' + flip + ')'
        });
        this.__hue_knob.style.marginTop = (1 - this.__color.h / 360) * 100 + 'px';
        this.__temp.s = 1;
        this.__temp.v = 1;
        linearGradient(this.__saturation_field, 'left', '#fff', this.__temp.toHexString());
        this.__input.value = this.__color.toString();
        Common.extend(this.__input.style, {
          backgroundColor: this.__color.toHexString(),
          color: 'rgb(' + flip + ',' + flip + ',' + flip + ')',
          textShadow: this.__input_textShadow + 'rgba(' + _flip + ',' + _flip + ',' + _flip + ',.7)'
        });
      }
    }]);
    return ColorController;
  }(Controller);
  var vendors = ['-moz-', '-o-', '-webkit-', '-ms-', ''];
  function linearGradient(elem, x, a, b) {
    elem.style.background = '';
    Common.each(vendors, function (vendor) {
      elem.style.cssText += 'background: ' + vendor + 'linear-gradient(' + x + ', ' + a + ' 0%, ' + b + ' 100%); ';
    });
  }
  function hueGradient(elem) {
    elem.style.background = '';
    elem.style.cssText += 'background: -moz-linear-gradient(top,  #ff0000 0%, #ff00ff 17%, #0000ff 34%, #00ffff 50%, #00ff00 67%, #ffff00 84%, #ff0000 100%);';
    elem.style.cssText += 'background: -webkit-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: -o-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: -ms-linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
    elem.style.cssText += 'background: linear-gradient(top,  #ff0000 0%,#ff00ff 17%,#0000ff 34%,#00ffff 50%,#00ff00 67%,#ffff00 84%,#ff0000 100%);';
  }

  var css = {
    load: function load(url, indoc) {
      var doc = indoc || document;
      var link = doc.createElement('link');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = url;
      doc.getElementsByTagName('head')[0].appendChild(link);
    },
    inject: function inject(cssContent, indoc) {
      var doc = indoc || document;
      var injected = document.createElement('style');
      injected.type = 'text/css';
      injected.innerHTML = cssContent;
      var head = doc.getElementsByTagName('head')[0];
      try {
        head.appendChild(injected);
      } catch (e) {
      }
    }
  };

  var saveDialogContents = "<div id=\"dg-save\" class=\"dg dialogue\">\n\n  Here's the new load parameter for your <code>GUI</code>'s constructor:\n\n  <textarea id=\"dg-new-constructor\"></textarea>\n\n  <div id=\"dg-save-locally\">\n\n    <input id=\"dg-local-storage\" type=\"checkbox\"/> Automatically save\n    values to <code>localStorage</code> on exit.\n\n    <div id=\"dg-local-explain\">The values saved to <code>localStorage</code> will\n      override those passed to <code>dat.GUI</code>'s constructor. This makes it\n      easier to work incrementally, but <code>localStorage</code> is fragile,\n      and your friends may not see the same values you do.\n\n    </div>\n\n  </div>\n\n</div>";

  var ControllerFactory = function ControllerFactory(object, property) {
    var initialValue = object[property];
    if (Common.isArray(arguments[2]) || Common.isObject(arguments[2])) {
      return new OptionController(object, property, arguments[2]);
    }
    if (Common.isNumber(initialValue)) {
      if (Common.isNumber(arguments[2]) && Common.isNumber(arguments[3])) {
        if (Common.isNumber(arguments[4])) {
          return new NumberControllerSlider(object, property, arguments[2], arguments[3], arguments[4]);
        }
        return new NumberControllerSlider(object, property, arguments[2], arguments[3]);
      }
      if (Common.isNumber(arguments[4])) {
        return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3], step: arguments[4] });
      }
      return new NumberControllerBox(object, property, { min: arguments[2], max: arguments[3] });
    }
    if (Common.isString(initialValue)) {
      return new StringController(object, property);
    }
    if (Common.isFunction(initialValue)) {
      return new FunctionController(object, property, '');
    }
    if (Common.isBoolean(initialValue)) {
      return new BooleanController(object, property);
    }
    return null;
  };

  function requestAnimationFrame(callback) {
    setTimeout(callback, 1000 / 60);
  }
  var requestAnimationFrame$1 = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || requestAnimationFrame;

  var CenteredDiv = function () {
    function CenteredDiv() {
      classCallCheck(this, CenteredDiv);
      this.backgroundElement = document.createElement('div');
      Common.extend(this.backgroundElement.style, {
        backgroundColor: 'rgba(0,0,0,0.8)',
        top: 0,
        left: 0,
        display: 'none',
        zIndex: '1000',
        opacity: 0,
        WebkitTransition: 'opacity 0.2s linear',
        transition: 'opacity 0.2s linear'
      });
      dom.makeFullscreen(this.backgroundElement);
      this.backgroundElement.style.position = 'fixed';
      this.domElement = document.createElement('div');
      Common.extend(this.domElement.style, {
        position: 'fixed',
        display: 'none',
        zIndex: '1001',
        opacity: 0,
        WebkitTransition: '-webkit-transform 0.2s ease-out, opacity 0.2s linear',
        transition: 'transform 0.2s ease-out, opacity 0.2s linear'
      });
      document.body.appendChild(this.backgroundElement);
      document.body.appendChild(this.domElement);
      var _this = this;
      dom.bind(this.backgroundElement, 'click', function () {
        _this.hide();
      });
    }
    createClass(CenteredDiv, [{
      key: 'show',
      value: function show() {
        var _this = this;
        this.backgroundElement.style.display = 'block';
        this.domElement.style.display = 'block';
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = 'scale(1.1)';
        this.layout();
        Common.defer(function () {
          _this.backgroundElement.style.opacity = 1;
          _this.domElement.style.opacity = 1;
          _this.domElement.style.webkitTransform = 'scale(1)';
        });
      }
    }, {
      key: 'hide',
      value: function hide() {
        var _this = this;
        var hide = function hide() {
          _this.domElement.style.display = 'none';
          _this.backgroundElement.style.display = 'none';
          dom.unbind(_this.domElement, 'webkitTransitionEnd', hide);
          dom.unbind(_this.domElement, 'transitionend', hide);
          dom.unbind(_this.domElement, 'oTransitionEnd', hide);
        };
        dom.bind(this.domElement, 'webkitTransitionEnd', hide);
        dom.bind(this.domElement, 'transitionend', hide);
        dom.bind(this.domElement, 'oTransitionEnd', hide);
        this.backgroundElement.style.opacity = 0;
        this.domElement.style.opacity = 0;
        this.domElement.style.webkitTransform = 'scale(1.1)';
      }
    }, {
      key: 'layout',
      value: function layout() {
        this.domElement.style.left = window.innerWidth / 2 - dom.getWidth(this.domElement) / 2 + 'px';
        this.domElement.style.top = window.innerHeight / 2 - dom.getHeight(this.domElement) / 2 + 'px';
      }
    }]);
    return CenteredDiv;
  }();

  var styleSheet = ___$insertStyle(".dg ul{list-style:none;margin:0;padding:0;width:100%;clear:both}.dg.ac{position:fixed;top:0;left:0;right:0;height:0;z-index:0}.dg:not(.ac) .main{overflow:hidden}.dg.main{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear}.dg.main.taller-than-window{overflow-y:auto}.dg.main.taller-than-window .close-button{opacity:1;margin-top:-1px;border-top:1px solid #2c2c2c}.dg.main ul.closed .close-button{opacity:1 !important}.dg.main:hover .close-button,.dg.main .close-button.drag{opacity:1}.dg.main .close-button{-webkit-transition:opacity .1s linear;-o-transition:opacity .1s linear;-moz-transition:opacity .1s linear;transition:opacity .1s linear;border:0;line-height:19px;height:20px;cursor:pointer;text-align:center;background-color:#000}.dg.main .close-button.close-top{position:relative}.dg.main .close-button.close-bottom{position:absolute}.dg.main .close-button:hover{background-color:#111}.dg.a{float:right;margin-right:15px;overflow-y:visible}.dg.a.has-save>ul.close-top{margin-top:0}.dg.a.has-save>ul.close-bottom{margin-top:27px}.dg.a.has-save>ul.closed{margin-top:0}.dg.a .save-row{top:0;z-index:1002}.dg.a .save-row.close-top{position:relative}.dg.a .save-row.close-bottom{position:fixed}.dg li{-webkit-transition:height .1s ease-out;-o-transition:height .1s ease-out;-moz-transition:height .1s ease-out;transition:height .1s ease-out;-webkit-transition:overflow .1s linear;-o-transition:overflow .1s linear;-moz-transition:overflow .1s linear;transition:overflow .1s linear}.dg li:not(.folder){cursor:auto;height:27px;line-height:27px;padding:0 4px 0 5px}.dg li.folder{padding:0;border-left:4px solid transparent}.dg li.title{cursor:pointer;margin-left:-4px}.dg .closed li:not(.title),.dg .closed ul li,.dg .closed ul li>*{height:0;overflow:hidden;border:0}.dg .cr{clear:both;padding-left:3px;height:27px;overflow:hidden}.dg .property-name{cursor:default;float:left;clear:left;width:40%;overflow:hidden;text-overflow:ellipsis}.dg .c{float:left;width:60%;position:relative}.dg .c input[type=text]{border:0;margin-top:4px;padding:3px;width:100%;float:right}.dg .has-slider input[type=text]{width:30%;margin-left:0}.dg .slider{float:left;width:66%;margin-left:-5px;margin-right:0;height:19px;margin-top:4px}.dg .slider-fg{height:100%}.dg .c input[type=checkbox]{margin-top:7px}.dg .c select{margin-top:5px}.dg .cr.function,.dg .cr.function .property-name,.dg .cr.function *,.dg .cr.boolean,.dg .cr.boolean *{cursor:pointer}.dg .cr.color{overflow:visible}.dg .selector{display:none;position:absolute;margin-left:-9px;margin-top:23px;z-index:10}.dg .c:hover .selector,.dg .selector.drag{display:block}.dg li.save-row{padding:0}.dg li.save-row .button{display:inline-block;padding:0px 6px}.dg.dialogue{background-color:#222;width:460px;padding:15px;font-size:13px;line-height:15px}#dg-new-constructor{padding:10px;color:#222;font-family:Monaco, monospace;font-size:10px;border:0;resize:none;box-shadow:inset 1px 1px 1px #888;word-wrap:break-word;margin:12px 0;display:block;width:440px;overflow-y:scroll;height:100px;position:relative}#dg-local-explain{display:none;font-size:11px;line-height:17px;border-radius:3px;background-color:#333;padding:8px;margin-top:10px}#dg-local-explain code{font-size:10px}#dat-gui-save-locally{display:none}.dg{color:#eee;font:11px 'Lucida Grande', sans-serif;text-shadow:0 -1px 0 #111}.dg.main::-webkit-scrollbar{width:5px;background:#1a1a1a}.dg.main::-webkit-scrollbar-corner{height:0;display:none}.dg.main::-webkit-scrollbar-thumb{border-radius:5px;background:#676767}.dg li:not(.folder){background:#1a1a1a;border-bottom:1px solid #2c2c2c}.dg li.save-row{line-height:25px;background:#dad5cb;border:0}.dg li.save-row select{margin-left:5px;width:108px}.dg li.save-row .button{margin-left:5px;margin-top:1px;border-radius:2px;font-size:9px;line-height:7px;padding:4px 4px 5px 4px;background:#c5bdad;color:#fff;text-shadow:0 1px 0 #b0a58f;box-shadow:0 -1px 0 #b0a58f;cursor:pointer}.dg li.save-row .button.gears{background:#c5bdad url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAANCAYAAAB/9ZQ7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAQJJREFUeNpiYKAU/P//PwGIC/ApCABiBSAW+I8AClAcgKxQ4T9hoMAEUrxx2QSGN6+egDX+/vWT4e7N82AMYoPAx/evwWoYoSYbACX2s7KxCxzcsezDh3evFoDEBYTEEqycggWAzA9AuUSQQgeYPa9fPv6/YWm/Acx5IPb7ty/fw+QZblw67vDs8R0YHyQhgObx+yAJkBqmG5dPPDh1aPOGR/eugW0G4vlIoTIfyFcA+QekhhHJhPdQxbiAIguMBTQZrPD7108M6roWYDFQiIAAv6Aow/1bFwXgis+f2LUAynwoIaNcz8XNx3Dl7MEJUDGQpx9gtQ8YCueB+D26OECAAQDadt7e46D42QAAAABJRU5ErkJggg==) 2px 1px no-repeat;height:7px;width:8px}.dg li.save-row .button:hover{background-color:#bab19e;box-shadow:0 -1px 0 #b0a58f}.dg li.folder{border-bottom:0}.dg li.title{padding-left:16px;background:#000 url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlI+hKgFxoCgAOw==) 6px 10px no-repeat;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.2)}.dg .closed li.title{background-image:url(data:image/gif;base64,R0lGODlhBQAFAJEAAP////Pz8////////yH5BAEAAAIALAAAAAAFAAUAAAIIlGIWqMCbWAEAOw==)}.dg .cr.boolean{border-left:3px solid #806787}.dg .cr.color{border-left:3px solid}.dg .cr.function{border-left:3px solid #e61d5f}.dg .cr.number{border-left:3px solid #2FA1D6}.dg .cr.number input[type=text]{color:#2FA1D6}.dg .cr.string{border-left:3px solid #1ed36f}.dg .cr.string input[type=text]{color:#1ed36f}.dg .cr.function:hover,.dg .cr.boolean:hover{background:#111}.dg .c input[type=text]{background:#303030;outline:none}.dg .c input[type=text]:hover{background:#3c3c3c}.dg .c input[type=text]:focus{background:#494949;color:#fff}.dg .c .slider{background:#303030;cursor:ew-resize}.dg .c .slider-fg{background:#2FA1D6;max-width:100%}.dg .c .slider:hover{background:#3c3c3c}.dg .c .slider:hover .slider-fg{background:#44abda}\n");

  css.inject(styleSheet);
  var CSS_NAMESPACE = 'dg';
  var HIDE_KEY_CODE = 72;
  var CLOSE_BUTTON_HEIGHT = 20;
  var DEFAULT_DEFAULT_PRESET_NAME = 'Default';
  var SUPPORTS_LOCAL_STORAGE = function () {
    try {
      return 'localStorage' in window && window.localStorage !== null;
    } catch (e) {
      return false;
    }
  }();
  var SAVE_DIALOGUE = void 0;
  var autoPlaceVirgin = true;
  var autoPlaceContainer = void 0;
  var hide = false;
  var hideableGuis = [];
  var GUI = function GUI(pars) {
    var _this = this;
    var params = pars || {};
    this.domElement = document.createElement('div');
    this.__ul = document.createElement('ul');
    this.domElement.appendChild(this.__ul);
    dom.addClass(this.domElement, CSS_NAMESPACE);
    this.__folders = {};
    this.__controllers = [];
    this.__rememberedObjects = [];
    this.__rememberedObjectIndecesToControllers = [];
    this.__listening = [];
    params = Common.defaults(params, {
      closeOnTop: false,
      autoPlace: true,
      width: GUI.DEFAULT_WIDTH
    });
    params = Common.defaults(params, {
      resizable: params.autoPlace,
      hideable: params.autoPlace
    });
    if (!Common.isUndefined(params.load)) {
      if (params.preset) {
        params.load.preset = params.preset;
      }
    } else {
      params.load = { preset: DEFAULT_DEFAULT_PRESET_NAME };
    }
    if (Common.isUndefined(params.parent) && params.hideable) {
      hideableGuis.push(this);
    }
    params.resizable = Common.isUndefined(params.parent) && params.resizable;
    if (params.autoPlace && Common.isUndefined(params.scrollable)) {
      params.scrollable = true;
    }
    var useLocalStorage = SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(this, 'isLocal')) === 'true';
    var saveToLocalStorage = void 0;
    Object.defineProperties(this,
    {
      parent: {
        get: function get$$1() {
          return params.parent;
        }
      },
      scrollable: {
        get: function get$$1() {
          return params.scrollable;
        }
      },
      autoPlace: {
        get: function get$$1() {
          return params.autoPlace;
        }
      },
      closeOnTop: {
        get: function get$$1() {
          return params.closeOnTop;
        }
      },
      preset: {
        get: function get$$1() {
          if (_this.parent) {
            return _this.getRoot().preset;
          }
          return params.load.preset;
        },
        set: function set$$1(v) {
          if (_this.parent) {
            _this.getRoot().preset = v;
          } else {
            params.load.preset = v;
          }
          setPresetSelectIndex(this);
          _this.revert();
        }
      },
      width: {
        get: function get$$1() {
          return params.width;
        },
        set: function set$$1(v) {
          params.width = v;
          setWidth(_this, v);
        }
      },
      name: {
        get: function get$$1() {
          return params.name;
        },
        set: function set$$1(v) {
          params.name = v;
          if (titleRowName) {
            titleRowName.innerHTML = params.name;
          }
        }
      },
      closed: {
        get: function get$$1() {
          return params.closed;
        },
        set: function set$$1(v) {
          params.closed = v;
          if (params.closed) {
            dom.addClass(_this.__ul, GUI.CLASS_CLOSED);
          } else {
            dom.removeClass(_this.__ul, GUI.CLASS_CLOSED);
          }
          this.onResize();
          if (_this.__closeButton) {
            _this.__closeButton.innerHTML = v ? GUI.TEXT_OPEN : GUI.TEXT_CLOSED;
          }
        }
      },
      load: {
        get: function get$$1() {
          return params.load;
        }
      },
      useLocalStorage: {
        get: function get$$1() {
          return useLocalStorage;
        },
        set: function set$$1(bool) {
          if (SUPPORTS_LOCAL_STORAGE) {
            useLocalStorage = bool;
            if (bool) {
              dom.bind(window, 'unload', saveToLocalStorage);
            } else {
              dom.unbind(window, 'unload', saveToLocalStorage);
            }
            localStorage.setItem(getLocalStorageHash(_this, 'isLocal'), bool);
          }
        }
      }
    });
    if (Common.isUndefined(params.parent)) {
      params.closed = false;
      dom.addClass(this.domElement, GUI.CLASS_MAIN);
      dom.makeSelectable(this.domElement, false);
      if (SUPPORTS_LOCAL_STORAGE) {
        if (useLocalStorage) {
          _this.useLocalStorage = true;
          var savedGui = localStorage.getItem(getLocalStorageHash(this, 'gui'));
          if (savedGui) {
            params.load = JSON.parse(savedGui);
          }
        }
      }
      this.__closeButton = document.createElement('div');
      this.__closeButton.innerHTML = GUI.TEXT_CLOSED;
      dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BUTTON);
      if (params.closeOnTop) {
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_TOP);
        this.domElement.insertBefore(this.__closeButton, this.domElement.childNodes[0]);
      } else {
        dom.addClass(this.__closeButton, GUI.CLASS_CLOSE_BOTTOM);
        this.domElement.appendChild(this.__closeButton);
      }
      dom.bind(this.__closeButton, 'click', function () {
        _this.closed = !_this.closed;
      });
    } else {
      if (params.closed === undefined) {
        params.closed = true;
      }
      var _titleRowName = document.createTextNode(params.name);
      dom.addClass(_titleRowName, 'controller-name');
      var titleRow = addRow(_this, _titleRowName);
      var onClickTitle = function onClickTitle(e) {
        e.preventDefault();
        _this.closed = !_this.closed;
        return false;
      };
      dom.addClass(this.__ul, GUI.CLASS_CLOSED);
      dom.addClass(titleRow, 'title');
      dom.bind(titleRow, 'click', onClickTitle);
      if (!params.closed) {
        this.closed = false;
      }
    }
    if (params.autoPlace) {
      if (Common.isUndefined(params.parent)) {
        if (autoPlaceVirgin) {
          autoPlaceContainer = document.createElement('div');
          dom.addClass(autoPlaceContainer, CSS_NAMESPACE);
          dom.addClass(autoPlaceContainer, GUI.CLASS_AUTO_PLACE_CONTAINER);
          document.body.appendChild(autoPlaceContainer);
          autoPlaceVirgin = false;
        }
        autoPlaceContainer.appendChild(this.domElement);
        dom.addClass(this.domElement, GUI.CLASS_AUTO_PLACE);
      }
      if (!this.parent) {
        setWidth(_this, params.width);
      }
    }
    this.__resizeHandler = function () {
      _this.onResizeDebounced();
    };
    dom.bind(window, 'resize', this.__resizeHandler);
    dom.bind(this.__ul, 'webkitTransitionEnd', this.__resizeHandler);
    dom.bind(this.__ul, 'transitionend', this.__resizeHandler);
    dom.bind(this.__ul, 'oTransitionEnd', this.__resizeHandler);
    this.onResize();
    if (params.resizable) {
      addResizeHandle(this);
    }
    saveToLocalStorage = function saveToLocalStorage() {
      if (SUPPORTS_LOCAL_STORAGE && localStorage.getItem(getLocalStorageHash(_this, 'isLocal')) === 'true') {
        localStorage.setItem(getLocalStorageHash(_this, 'gui'), JSON.stringify(_this.getSaveObject()));
      }
    };
    this.saveToLocalStorageIfPossible = saveToLocalStorage;
    function resetWidth() {
      var root = _this.getRoot();
      root.width += 1;
      Common.defer(function () {
        root.width -= 1;
      });
    }
    if (!params.parent) {
      resetWidth();
    }
  };
  GUI.toggleHide = function () {
    hide = !hide;
    Common.each(hideableGuis, function (gui) {
      gui.domElement.style.display = hide ? 'none' : '';
    });
  };
  GUI.CLASS_AUTO_PLACE = 'a';
  GUI.CLASS_AUTO_PLACE_CONTAINER = 'ac';
  GUI.CLASS_MAIN = 'main';
  GUI.CLASS_CONTROLLER_ROW = 'cr';
  GUI.CLASS_TOO_TALL = 'taller-than-window';
  GUI.CLASS_CLOSED = 'closed';
  GUI.CLASS_CLOSE_BUTTON = 'close-button';
  GUI.CLASS_CLOSE_TOP = 'close-top';
  GUI.CLASS_CLOSE_BOTTOM = 'close-bottom';
  GUI.CLASS_DRAG = 'drag';
  GUI.DEFAULT_WIDTH = 245;
  GUI.TEXT_CLOSED = 'Close Controls';
  GUI.TEXT_OPEN = 'Open Controls';
  GUI._keydownHandler = function (e) {
    if (document.activeElement.type !== 'text' && (e.which === HIDE_KEY_CODE || e.keyCode === HIDE_KEY_CODE)) {
      GUI.toggleHide();
    }
  };
  dom.bind(window, 'keydown', GUI._keydownHandler, false);
  Common.extend(GUI.prototype,
  {
    add: function add(object, property) {
      return _add(this, object, property, {
        factoryArgs: Array.prototype.slice.call(arguments, 2)
      });
    },
    addColor: function addColor(object, property) {
      return _add(this, object, property, {
        color: true
      });
    },
    remove: function remove(controller) {
      this.__ul.removeChild(controller.__li);
      this.__controllers.splice(this.__controllers.indexOf(controller), 1);
      var _this = this;
      Common.defer(function () {
        _this.onResize();
      });
    },
    destroy: function destroy() {
      if (this.parent) {
        throw new Error('Only the root GUI should be removed with .destroy(). ' + 'For subfolders, use gui.removeFolder(folder) instead.');
      }
      if (this.autoPlace) {
        autoPlaceContainer.removeChild(this.domElement);
      }
      var _this = this;
      Common.each(this.__folders, function (subfolder) {
        _this.removeFolder(subfolder);
      });
      dom.unbind(window, 'keydown', GUI._keydownHandler, false);
      removeListeners(this);
    },
    addFolder: function addFolder(name) {
      if (this.__folders[name] !== undefined) {
        throw new Error('You already have a folder in this GUI by the' + ' name "' + name + '"');
      }
      var newGuiParams = { name: name, parent: this };
      newGuiParams.autoPlace = this.autoPlace;
      if (this.load &&
      this.load.folders &&
      this.load.folders[name]) {
        newGuiParams.closed = this.load.folders[name].closed;
        newGuiParams.load = this.load.folders[name];
      }
      var gui = new GUI(newGuiParams);
      this.__folders[name] = gui;
      var li = addRow(this, gui.domElement);
      dom.addClass(li, 'folder');
      return gui;
    },
    removeFolder: function removeFolder(folder) {
      this.__ul.removeChild(folder.domElement.parentElement);
      delete this.__folders[folder.name];
      if (this.load &&
      this.load.folders &&
      this.load.folders[folder.name]) {
        delete this.load.folders[folder.name];
      }
      removeListeners(folder);
      var _this = this;
      Common.each(folder.__folders, function (subfolder) {
        folder.removeFolder(subfolder);
      });
      Common.defer(function () {
        _this.onResize();
      });
    },
    open: function open() {
      this.closed = false;
    },
    close: function close() {
      this.closed = true;
    },
    onResize: function onResize() {
      var root = this.getRoot();
      if (root.scrollable) {
        var top = dom.getOffset(root.__ul).top;
        var h = 0;
        Common.each(root.__ul.childNodes, function (node) {
          if (!(root.autoPlace && node === root.__save_row)) {
            h += dom.getHeight(node);
          }
        });
        if (window.innerHeight - top - CLOSE_BUTTON_HEIGHT < h) {
          dom.addClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = window.innerHeight - top - CLOSE_BUTTON_HEIGHT + 'px';
        } else {
          dom.removeClass(root.domElement, GUI.CLASS_TOO_TALL);
          root.__ul.style.height = 'auto';
        }
      }
      if (root.__resize_handle) {
        Common.defer(function () {
          root.__resize_handle.style.height = root.__ul.offsetHeight + 'px';
        });
      }
      if (root.__closeButton) {
        root.__closeButton.style.width = root.width + 'px';
      }
    },
    onResizeDebounced: Common.debounce(function () {
      this.onResize();
    }, 50),
    remember: function remember() {
      if (Common.isUndefined(SAVE_DIALOGUE)) {
        SAVE_DIALOGUE = new CenteredDiv();
        SAVE_DIALOGUE.domElement.innerHTML = saveDialogContents;
      }
      if (this.parent) {
        throw new Error('You can only call remember on a top level GUI.');
      }
      var _this = this;
      Common.each(Array.prototype.slice.call(arguments), function (object) {
        if (_this.__rememberedObjects.length === 0) {
          addSaveMenu(_this);
        }
        if (_this.__rememberedObjects.indexOf(object) === -1) {
          _this.__rememberedObjects.push(object);
        }
      });
      if (this.autoPlace) {
        setWidth(this, this.width);
      }
    },
    getRoot: function getRoot() {
      var gui = this;
      while (gui.parent) {
        gui = gui.parent;
      }
      return gui;
    },
    getSaveObject: function getSaveObject() {
      var toReturn = this.load;
      toReturn.closed = this.closed;
      if (this.__rememberedObjects.length > 0) {
        toReturn.preset = this.preset;
        if (!toReturn.remembered) {
          toReturn.remembered = {};
        }
        toReturn.remembered[this.preset] = getCurrentPreset(this);
      }
      toReturn.folders = {};
      Common.each(this.__folders, function (element, key) {
        toReturn.folders[key] = element.getSaveObject();
      });
      return toReturn;
    },
    save: function save() {
      if (!this.load.remembered) {
        this.load.remembered = {};
      }
      this.load.remembered[this.preset] = getCurrentPreset(this);
      markPresetModified(this, false);
      this.saveToLocalStorageIfPossible();
    },
    saveAs: function saveAs(presetName) {
      if (!this.load.remembered) {
        this.load.remembered = {};
        this.load.remembered[DEFAULT_DEFAULT_PRESET_NAME] = getCurrentPreset(this, true);
      }
      this.load.remembered[presetName] = getCurrentPreset(this);
      this.preset = presetName;
      addPresetOption(this, presetName, true);
      this.saveToLocalStorageIfPossible();
    },
    revert: function revert(gui) {
      Common.each(this.__controllers, function (controller) {
        if (!this.getRoot().load.remembered) {
          controller.setValue(controller.initialValue);
        } else {
          recallSavedValue(gui || this.getRoot(), controller);
        }
        if (controller.__onFinishChange) {
          controller.__onFinishChange.call(controller, controller.getValue());
        }
      }, this);
      Common.each(this.__folders, function (folder) {
        folder.revert(folder);
      });
      if (!gui) {
        markPresetModified(this.getRoot(), false);
      }
    },
    listen: function listen(controller) {
      var init = this.__listening.length === 0;
      this.__listening.push(controller);
      if (init) {
        updateDisplays(this.__listening);
      }
    },
    updateDisplay: function updateDisplay() {
      Common.each(this.__controllers, function (controller) {
        controller.updateDisplay();
      });
      Common.each(this.__folders, function (folder) {
        folder.updateDisplay();
      });
    }
  });
  function addRow(gui, newDom, liBefore) {
    var li = document.createElement('li');
    if (newDom) {
      li.appendChild(newDom);
    }
    if (liBefore) {
      gui.__ul.insertBefore(li, liBefore);
    } else {
      gui.__ul.appendChild(li);
    }
    gui.onResize();
    return li;
  }
  function removeListeners(gui) {
    dom.unbind(window, 'resize', gui.__resizeHandler);
    if (gui.saveToLocalStorageIfPossible) {
      dom.unbind(window, 'unload', gui.saveToLocalStorageIfPossible);
    }
  }
  function markPresetModified(gui, modified) {
    var opt = gui.__preset_select[gui.__preset_select.selectedIndex];
    if (modified) {
      opt.innerHTML = opt.value + '*';
    } else {
      opt.innerHTML = opt.value;
    }
  }
  function augmentController(gui, li, controller) {
    controller.__li = li;
    controller.__gui = gui;
    Common.extend(controller,                                   {
      options: function options(_options) {
        if (arguments.length > 1) {
          var nextSibling = controller.__li.nextElementSibling;
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: nextSibling,
            factoryArgs: [Common.toArray(arguments)]
          });
        }
        if (Common.isArray(_options) || Common.isObject(_options)) {
          var _nextSibling = controller.__li.nextElementSibling;
          controller.remove();
          return _add(gui, controller.object, controller.property, {
            before: _nextSibling,
            factoryArgs: [_options]
          });
        }
      },
      name: function name(_name) {
        controller.__li.firstElementChild.firstElementChild.innerHTML = _name;
        return controller;
      },
      listen: function listen() {
        controller.__gui.listen(controller);
        return controller;
      },
      remove: function remove() {
        controller.__gui.remove(controller);
        return controller;
      }
    });
    if (controller instanceof NumberControllerSlider) {
      var box = new NumberControllerBox(controller.object, controller.property, { min: controller.__min, max: controller.__max, step: controller.__step });
      Common.each(['updateDisplay', 'onChange', 'onFinishChange', 'step'], function (method) {
        var pc = controller[method];
        var pb = box[method];
        controller[method] = box[method] = function () {
          var args = Array.prototype.slice.call(arguments);
          pb.apply(box, args);
          return pc.apply(controller, args);
        };
      });
      dom.addClass(li, 'has-slider');
      controller.domElement.insertBefore(box.domElement, controller.domElement.firstElementChild);
    } else if (controller instanceof NumberControllerBox) {
      var r = function r(returned) {
        if (Common.isNumber(controller.__min) && Common.isNumber(controller.__max)) {
          var oldName = controller.__li.firstElementChild.firstElementChild.innerHTML;
          var wasListening = controller.__gui.__listening.indexOf(controller) > -1;
          controller.remove();
          var newController = _add(gui, controller.object, controller.property, {
            before: controller.__li.nextElementSibling,
            factoryArgs: [controller.__min, controller.__max, controller.__step]
          });
          newController.name(oldName);
          if (wasListening) newController.listen();
          return newController;
        }
        return returned;
      };
      controller.min = Common.compose(r, controller.min);
      controller.max = Common.compose(r, controller.max);
    } else if (controller instanceof BooleanController) {
      dom.bind(li, 'click', function () {
        dom.fakeEvent(controller.__checkbox, 'click');
      });
      dom.bind(controller.__checkbox, 'click', function (e) {
        e.stopPropagation();
      });
    } else if (controller instanceof FunctionController) {
      dom.bind(li, 'click', function () {
        dom.fakeEvent(controller.__button, 'click');
      });
      dom.bind(li, 'mouseover', function () {
        dom.addClass(controller.__button, 'hover');
      });
      dom.bind(li, 'mouseout', function () {
        dom.removeClass(controller.__button, 'hover');
      });
    } else if (controller instanceof ColorController) {
      dom.addClass(li, 'color');
      controller.updateDisplay = Common.compose(function (val) {
        li.style.borderLeftColor = controller.__color.toString();
        return val;
      }, controller.updateDisplay);
      controller.updateDisplay();
    }
    controller.setValue = Common.compose(function (val) {
      if (gui.getRoot().__preset_select && controller.isModified()) {
        markPresetModified(gui.getRoot(), true);
      }
      return val;
    }, controller.setValue);
  }
  function recallSavedValue(gui, controller) {
    var root = gui.getRoot();
    var matchedIndex = root.__rememberedObjects.indexOf(controller.object);
    if (matchedIndex !== -1) {
      var controllerMap = root.__rememberedObjectIndecesToControllers[matchedIndex];
      if (controllerMap === undefined) {
        controllerMap = {};
        root.__rememberedObjectIndecesToControllers[matchedIndex] = controllerMap;
      }
      controllerMap[controller.property] = controller;
      if (root.load && root.load.remembered) {
        var presetMap = root.load.remembered;
        var preset = void 0;
        if (presetMap[gui.preset]) {
          preset = presetMap[gui.preset];
        } else if (presetMap[DEFAULT_DEFAULT_PRESET_NAME]) {
          preset = presetMap[DEFAULT_DEFAULT_PRESET_NAME];
        } else {
          return;
        }
        if (preset[matchedIndex] && preset[matchedIndex][controller.property] !== undefined) {
          var value = preset[matchedIndex][controller.property];
          controller.initialValue = value;
          controller.setValue(value);
        }
      }
    }
  }
  function _add(gui, object, property, params) {
    if (object[property] === undefined) {
      throw new Error('Object "' + object + '" has no property "' + property + '"');
    }
    var controller = void 0;
    if (params.color) {
      controller = new ColorController(object, property);
    } else {
      var factoryArgs = [object, property].concat(params.factoryArgs);
      controller = ControllerFactory.apply(gui, factoryArgs);
    }
    if (params.before instanceof Controller) {
      params.before = params.before.__li;
    }
    recallSavedValue(gui, controller);
    dom.addClass(controller.domElement, 'c');
    var name = document.createElement('span');
    dom.addClass(name, 'property-name');
    name.innerHTML = controller.property;
    var container = document.createElement('div');
    container.appendChild(name);
    container.appendChild(controller.domElement);
    var li = addRow(gui, container, params.before);
    dom.addClass(li, GUI.CLASS_CONTROLLER_ROW);
    if (controller instanceof ColorController) {
      dom.addClass(li, 'color');
    } else {
      dom.addClass(li, _typeof(controller.getValue()));
    }
    augmentController(gui, li, controller);
    gui.__controllers.push(controller);
    return controller;
  }
  function getLocalStorageHash(gui, key) {
    return document.location.href + '.' + key;
  }
  function addPresetOption(gui, name, setSelected) {
    var opt = document.createElement('option');
    opt.innerHTML = name;
    opt.value = name;
    gui.__preset_select.appendChild(opt);
    if (setSelected) {
      gui.__preset_select.selectedIndex = gui.__preset_select.length - 1;
    }
  }
  function showHideExplain(gui, explain) {
    explain.style.display = gui.useLocalStorage ? 'block' : 'none';
  }
  function addSaveMenu(gui) {
    var div = gui.__save_row = document.createElement('li');
    dom.addClass(gui.domElement, 'has-save');
    gui.__ul.insertBefore(div, gui.__ul.firstChild);
    dom.addClass(div, 'save-row');
    var gears = document.createElement('span');
    gears.innerHTML = '&nbsp;';
    dom.addClass(gears, 'button gears');
    var button = document.createElement('span');
    button.innerHTML = 'Save';
    dom.addClass(button, 'button');
    dom.addClass(button, 'save');
    var button2 = document.createElement('span');
    button2.innerHTML = 'New';
    dom.addClass(button2, 'button');
    dom.addClass(button2, 'save-as');
    var button3 = document.createElement('span');
    button3.innerHTML = 'Revert';
    dom.addClass(button3, 'button');
    dom.addClass(button3, 'revert');
    var select = gui.__preset_select = document.createElement('select');
    if (gui.load && gui.load.remembered) {
      Common.each(gui.load.remembered, function (value, key) {
        addPresetOption(gui, key, key === gui.preset);
      });
    } else {
      addPresetOption(gui, DEFAULT_DEFAULT_PRESET_NAME, false);
    }
    dom.bind(select, 'change', function () {
      for (var index = 0; index < gui.__preset_select.length; index++) {
        gui.__preset_select[index].innerHTML = gui.__preset_select[index].value;
      }
      gui.preset = this.value;
    });
    div.appendChild(select);
    div.appendChild(gears);
    div.appendChild(button);
    div.appendChild(button2);
    div.appendChild(button3);
    if (SUPPORTS_LOCAL_STORAGE) {
      var explain = document.getElementById('dg-local-explain');
      var localStorageCheckBox = document.getElementById('dg-local-storage');
      var saveLocally = document.getElementById('dg-save-locally');
      saveLocally.style.display = 'block';
      if (localStorage.getItem(getLocalStorageHash(gui, 'isLocal')) === 'true') {
        localStorageCheckBox.setAttribute('checked', 'checked');
      }
      showHideExplain(gui, explain);
      dom.bind(localStorageCheckBox, 'change', function () {
        gui.useLocalStorage = !gui.useLocalStorage;
        showHideExplain(gui, explain);
      });
    }
    var newConstructorTextArea = document.getElementById('dg-new-constructor');
    dom.bind(newConstructorTextArea, 'keydown', function (e) {
      if (e.metaKey && (e.which === 67 || e.keyCode === 67)) {
        SAVE_DIALOGUE.hide();
      }
    });
    dom.bind(gears, 'click', function () {
      newConstructorTextArea.innerHTML = JSON.stringify(gui.getSaveObject(), undefined, 2);
      SAVE_DIALOGUE.show();
      newConstructorTextArea.focus();
      newConstructorTextArea.select();
    });
    dom.bind(button, 'click', function () {
      gui.save();
    });
    dom.bind(button2, 'click', function () {
      var presetName = prompt('Enter a new preset name.');
      if (presetName) {
        gui.saveAs(presetName);
      }
    });
    dom.bind(button3, 'click', function () {
      gui.revert();
    });
  }
  function addResizeHandle(gui) {
    var pmouseX = void 0;
    gui.__resize_handle = document.createElement('div');
    Common.extend(gui.__resize_handle.style, {
      width: '6px',
      marginLeft: '-3px',
      height: '200px',
      cursor: 'ew-resize',
      position: 'absolute'
    });
    function drag(e) {
      e.preventDefault();
      gui.width += pmouseX - e.clientX;
      gui.onResize();
      pmouseX = e.clientX;
      return false;
    }
    function dragStop() {
      dom.removeClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.unbind(window, 'mousemove', drag);
      dom.unbind(window, 'mouseup', dragStop);
    }
    function dragStart(e) {
      e.preventDefault();
      pmouseX = e.clientX;
      dom.addClass(gui.__closeButton, GUI.CLASS_DRAG);
      dom.bind(window, 'mousemove', drag);
      dom.bind(window, 'mouseup', dragStop);
      return false;
    }
    dom.bind(gui.__resize_handle, 'mousedown', dragStart);
    dom.bind(gui.__closeButton, 'mousedown', dragStart);
    gui.domElement.insertBefore(gui.__resize_handle, gui.domElement.firstElementChild);
  }
  function setWidth(gui, w) {
    gui.domElement.style.width = w + 'px';
    if (gui.__save_row && gui.autoPlace) {
      gui.__save_row.style.width = w + 'px';
    }
    if (gui.__closeButton) {
      gui.__closeButton.style.width = w + 'px';
    }
  }
  function getCurrentPreset(gui, useInitialValues) {
    var toReturn = {};
    Common.each(gui.__rememberedObjects, function (val, index) {
      var savedValues = {};
      var controllerMap = gui.__rememberedObjectIndecesToControllers[index];
      Common.each(controllerMap, function (controller, property) {
        savedValues[property] = useInitialValues ? controller.initialValue : controller.getValue();
      });
      toReturn[index] = savedValues;
    });
    return toReturn;
  }
  function setPresetSelectIndex(gui) {
    for (var index = 0; index < gui.__preset_select.length; index++) {
      if (gui.__preset_select[index].value === gui.preset) {
        gui.__preset_select.selectedIndex = index;
      }
    }
  }
  function updateDisplays(controllerArray) {
    if (controllerArray.length !== 0) {
      requestAnimationFrame$1.call(window, function () {
        updateDisplays(controllerArray);
      });
    }
    Common.each(controllerArray, function (c) {
      c.updateDisplay();
    });
  }

  var index = {
    color: {
      Color: Color,
      math: ColorMath,
      interpret: interpret
    },
    controllers: {
      Controller: Controller,
      BooleanController: BooleanController,
      OptionController: OptionController,
      StringController: StringController,
      NumberController: NumberController,
      NumberControllerBox: NumberControllerBox,
      NumberControllerSlider: NumberControllerSlider,
      FunctionController: FunctionController,
      ColorController: ColorController
    },
    dom: {
      dom: dom
    },
    gui: {
      GUI: GUI
    },
    GUI: GUI
  };
  //# sourceMappingURL=dat.gui.module.js.map

  var dat_gui_module = /*#__PURE__*/Object.freeze({
    default: index
  });

  var dat = ( dat_gui_module && index ) || dat_gui_module;

  const { options: options$1, tools: tools$1, effects: effects$2 } = config;



  function toggleAudio(value, audioCtx) { 
    if (!value) {
      const bufferSource = audioCtx.createBufferSource();
      bufferSource.loop = true;
      databender.render(window.trackBuffer, effects$2).then(function (buffer) { 
        window.prevBufferSource.stop();
        bufferSource.buffer = buffer;
        bufferSource.connect(audioCtx.destination);
        bufferSource.start(audioCtx.currentTime);
        window.prevBufferSource = bufferSource;
      });
    } else {
      window.prevBufferSource.start(audioCtx.currentTime);
    }
  }

  let isDragging = false;
  let startingPosition;


  const handleMousedown = function (e) {
    isDragging = true;
    startingPosition = [e.clientX, e.clientY];
  };

  const handleMousemove = function (context, overlayContext, databender, e) {
    if (!startingPosition) {
      return false;
    }

    if (isDragging) { 
      handleDraw(e, context, overlayContext, databender); 
    }
  };

  const handleMouseup = function (e) {
    if (!(e.clientX === startingPosition[0] && e.clientY === startingPosition[1])) { 
      isDragging = true;
    } else {
      console.log('what happened');
    }
    isDragging = false;
    startingPosition = [];
  };

  function toggleTool(tool, value, canvas, context, databender, overlayContext, boundHandleMousemove, boundHandleFill) { 
    if (value) { 
      if (tool === 'Brush') { 
        canvas.addEventListener('mousedown', handleMousedown);
        canvas.addEventListener('mousemove', boundHandleMousemove);
        canvas.addEventListener('mouseup', handleMouseup);
      } else {
        canvas.addEventListener('click', boundHandleFill);
      }
    } else {
      if (tool === 'Brush') { 
        canvas.removeEventListener('mousedown', handleMousedown);
        canvas.removeEventListener('mousemove', boundHandleMousemove);
        canvas.removeEventListener('mouseup', handleMouseup);
      } else {
        canvas.removeEventListener('click', boundHandleFill);
      }
    }
  }

  function handleDatGUI(databender, audioCtx, canvas, context, overlayContext) {
    const gui = new dat.GUI();
    const boundHandleMousemove = handleMousemove.bind(null, context, overlayContext, databender);

    const optionsTab = gui.addFolder('Options');
    Object.keys(options$1).forEach(option => {
      const controller = optionsTab.add(options$1, option);

      if (option === 'playAudio') {
        controller.onFinishChange(value => toggleAudio(value, audioCtx));
      }
    });

    const toolsTab = gui.addFolder('Tools');

    Object.keys(tools$1).forEach(tool => {
      const boundHandleFill = handleFill.bind(null, overlayContext, databender);
      const toolTab  = toolsTab.addFolder(tool);
      Object.keys(tools$1[tool]).forEach(param => {
        const controller = toolTab.add(tools$1[tool], param);

        if (param === 'active') {
          controller.onFinishChange(value => {
            toggleTool(tool, value, canvas, context, databender, overlayContext, boundHandleMousemove, boundHandleFill);
          });
        }
      });
    });

    const effectsTab = gui.addFolder('Effects');
    Object.keys(effects$2).forEach(effect => {
      const effectTab = effectsTab.addFolder(effect);
      Object.keys(effects$2[effect]).forEach(function (param) {
        effectTab.add(effects$2[effect], param);            
        if (options$1.playAudio && (param === 'active' || (param !== 'active' && value))) {
          const bufferSource = audioCtx.createBufferSource();
          const boundRender = databender.render.bind(databender);
          bufferSource.loop = true;

          databender.boundRender(window.trackBuffer, effects$2).then(function (buffer) { 
            if (window.prevBufferSource) {
              window.prevBufferSource.stop();
            }
            bufferSource.buffer = buffer;
            bufferSource.connect(audioCtx.destination);
            bufferSource.start(audioCtx.currentTime);
            window.prevBufferSource = bufferSource;
          });
        }
      });
    });
  }
  function renderVideoToCanvas(v, context, databender) {
    let timer;
    let time;

    function drawFrame() {
      if(v.paused || v.ended) return false;
      return databender.bend(v, context, effects$2);
    }

    (function repeat() {
      time = 1000 / options$1.frameRate;  
      drawFrame(v, context);
      timer = setTimeout(repeat, time);
    }());
  }

  function handleImageUpload (e, context, databender) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        return databender.bend(img, context, effects$2)
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(e);
  }
  function handleVideoUpload(e, context, databender){
    const reader = new FileReader();
    const video = document.createElement('video');

    video.addEventListener('play', function () {
      renderVideoToCanvas(this, context, databender);
    }, false);

    reader.onload = function (event) {
      video.src = this.result;
      video.muted = true;
      video.type = "video/mp4";
      video.loop = true;
      video.play();
    };
    reader.readAsDataURL(e);
  }

  function loadTrack (audioCtx, databender) {
    fetch('sample.mp3')
      .then((response) => response.arrayBuffer())
      .then((buffer) => window.trackBuffer = buffer)
      .then((buffer) => {
        audioCtx.decodeAudioData(buffer).then((decodedData) => {
          databender.render(decodedData, effects$2).then(buffer => { 
            const bufferSource = audioCtx.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(audioCtx.destination);
            if (options$1.playAudio) {
              bufferSource.start(0);
            }
            window.prevBufferSource = bufferSource; 
          });
        });
      }).catch((err) => {
        console.error(`Error while loading: ${err}`);
      });
  }
  function getFileType(file) {
    const imageFileTypes = ['jpg', 'png', 'bmp', 'jpeg'];
    const videoFileTypes = ['mp4', 'webm'];
    const fileExtension = file.name.split('.')[1];
    let fileType;

    if (imageFileTypes.indexOf(fileExtension) >= 0) { 
      fileType = 'image';
    } else if (videoFileTypes.indexOf(fileExtension) >= 0) {
      fileType = 'video';
    } else {
      return null;
    }

    return fileType;
  }
  function handleFileUpload(file, context, databender) {
    const type = getFileType(file);
    switch (type) { 
      case 'image': 
        return handleImageUpload(file, context, databender);
      case 'video':
        return handleVideoUpload(file, context, databender);
      default:
        alert('File Type is not supported');
        return false;
    }
  }
  function prepareCanvas(id) {
    const canvas = document.querySelector(id);
    const context = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return { canvas, context };
  }

  function getDrawCoordinate(origin, brushSize) { 
    const drawCoordinate = origin - Math.floor(brushSize/2);
    return drawCoordinate < 0 ? 0 : drawCoordinate;
  }

  function handleDraw(e, context, overlayContext, databender) { 
    const { clientX, clientY } = e;
    const { size } = tools$1.Brush;
    const drawX = getDrawCoordinate(clientX, size);
    const drawY = getDrawCoordinate(clientY, size);
    const imageSubset = context.getImageData(drawX, drawY, size, size);

    databender.bend(imageSubset, overlayContext, effects$2, drawX, drawY);
  }

  function handleFill(overlayContext, databender) {
    // @NOTE - Would like to think of a better way to pass imageData,
    // as this only works because we have already set imageData implicitly.
    databender.bend(databender.imageData, overlayContext, effects$2);
  }

  function prepareUpload(context, databender) {
    const upload = document.querySelector('.upload');
    const fileUpload = document.querySelector('input[type=file]');
    upload.ondragover = function () { this.classList.add('hover'); return false; };
    upload.ondragend = function () { this.classList.remove('hover'); return false; };
    upload.ondrop = function (e) {
      e.preventDefault();
      document.querySelector('.upload').style.display = 'none';
      const files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
      handleFileUpload(files[0], context, databender);
    };
  }

  function main () {
    const audioCtx = new AudioContext();
    const { canvas, context } = prepareCanvas('#canvas');
    const { canvas: overlayCanvas, context: overlayContext } = prepareCanvas('#overlay');
    const databender = new databend(audioCtx);
    loadTrack(audioCtx, databender);
    prepareUpload();
    handleDatGUI(databender, audioCtx, canvas, context, overlayContext);
  }
  main();

  var main_1 = {

  };

  return main_1;

}());
