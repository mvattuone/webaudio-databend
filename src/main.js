const config = require('./config.json');
const Databender = require('./databend.js');
const dat = require('dat.gui');

function handleDatGUI(databender, audioCtx, context, overlayContext){
  var gui = new dat.GUI();
  Object.keys(config).forEach(function (effect) {
    if (effect === 'frameRate' || effect === 'sampleRate') { 
      gui.add(config, effect)
    } else if (effect === 'playAudio') {
      gui.add(config, effect)
        .onFinishChange(function (value) {
          if (!value) {
            var bufferSource = audioCtx.createBufferSource();
            bufferSource.loop = true;
            databender.render(window.trackBuffer, config).then(function (buffer) { 
              window.prevBufferSource.stop();
              bufferSource.buffer = buffer;
              bufferSource.connect(audioCtx.destination);
              bufferSource.start(audioCtx.currentTime);
              window.prevBufferSource = bufferSource;
            });
          } else {
            window.prevBufferSource.start(audioCtx.currentTime);
          }
        });
    } else {
      var effectTab = gui.addFolder(effect);
      if (effect === "brush") { 
        effectTab.add(config["brush"], "active").onFinishChange((value) => {
          if (value) { 
            canvas.addEventListener('mousemove', (e) => handleDraw(e, context, overlayContext, databender));
          } else {
            canvas.removeEventListener('mousemove', handleDraw);
          }
        });
        effectTab.add(config["brush"], "size");
      } else {
        Object.keys(config[effect]).forEach(function (param) {
          effectTab.add(config[effect], param)            
            .onFinishChange(function (value) { 
              databender.bend(databender.imageData)
                .then((buffer) => databender.render.call(databender, buffer, config))
                .then((buffer) => databender.draw.call(databender, buffer, context))
            });

          if (config.playAudio && (param === 'active' || (param !== 'active' && value))) {
            var bufferSource = audioCtx.createBufferSource();
            var boundRender = databender.render.bind(databender);
            bufferSource.loop = true;

            databender.boundRender(window.trackBuffer, config).then(function (buffer) { 
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
      }
    };
  });
};

function renderVideoToCanvas(v, context, databender) {
  var timer;
  var time;

  function drawFrame() {
    if(v.paused || v.ended) return false;
    var databent = databender.bend(v)
      .then((buffer) => databender.render.call(databender, buffer, config))
      .then((buffer) => databender.draw.call(databender, buffer, context))
  }

  (function repeat() {
    time = 1000 / config.frameRate;  
    drawFrame(v, context);
    timer = setTimeout(repeat, time);
  }());
}

function handleImageUpload (e, context, databender) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      databender.bend(img)
      .then((buffer) => databender.render.call(databender, buffer, config))
      .then((buffer) => databender.draw.call(databender, buffer, context))
    };
    img.src = e.target.result;
  }
  reader.readAsDataURL(e);
}; 

function handleVideoUpload(e, canvas, databender){
  var reader = new FileReader();
  var video = document.createElement('video');

  video.addEventListener('play', function () {
    renderVideoToCanvas(this, canvas, databender);
  }, false);

  reader.onload = function (event) {
    video.src = this.result;
    video.muted = true;
    video.type = "video/mp4";
    video.loop = true;
    video.play();
  }
  reader.readAsDataURL(e);
}

function loadTrack (audioCtx, databender) {
  fetch('sample.mp3')
    .then((response) => response.arrayBuffer())
    .then((buffer) => window.trackBuffer = buffer)
    .then((buffer) => {
      audioCtx.decodeAudioData(buffer).then((decodedData) => {
        databender.render(decodedData, config).then(buffer => { 
          var bufferSource = audioCtx.createBufferSource();
          bufferSource.buffer = buffer;
          bufferSource.connect(audioCtx.destination);
          if (config.playAudio) {
            bufferSource.start(0);
          }
          window.prevBufferSource = bufferSource; 
        });
      });
    }).catch((err) => {
      console.error(`Error while loading: ${err}`);
    });
};


function getFileType(file) {
  var imageFileTypes = ['jpg', 'png', 'bmp', 'jpeg'];
  var videoFileTypes = ['mp4', 'webm'];
  var fileExtension = file.name.split('.')[1];
  var fileType;

  if (imageFileTypes.indexOf(fileExtension) >= 0) { 
    fileType = 'image';
  } else if (videoFileTypes.indexOf(fileExtension) >= 0) {
    fileType = 'video';
  } else {
    return null;
  }

  return fileType;
};


function handleFileUpload(file, context, databender) {
  var type = getFileType(file);
  switch (type) { 
    case 'image': 
      return handleImageUpload(file, context, databender);
    case 'video':
      return handleVideoUpload(file, context, databender);
    default:
      alert('File Type is not supported');
      return false;
  }
};

function prepareCanvas(id) {
  const canvas = document.querySelector(id);
  const context = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  return { canvas, context };
}

function handleDraw(e, context, overlayContext, databender) { 
  overlayContext.clearRect(0, 0, canvas.width, canvas.height);
  const { clientX, clientY } = e;
  const drawX = clientX - Math.floor(parseInt(config.brush.size)/2) < 0 
    ? 0 
    : clientX - Math.floor(config.brush.size/2); 
  const drawY = clientY - Math.floor(parseInt(config.brush.size/2)) < 0 
    ? 0 
    : clientY - Math.floor(config.brush.size/2); 
  const imageSubset = context.getImageData(drawX, drawY, config.brush.size, config.brush.size);

  databender.bend(imageSubset)
    .then((buffer) => databender.render.call(databender, buffer, config))
    .then((buffer) => databender.draw.call(databender, buffer, overlayContext, drawX, drawY))
}


function main () {
  const audioCtx = new AudioContext();
  const { canvas, context } = prepareCanvas('#canvas');
  const { canvas: overlayCanvas, context: overlayContext } = prepareCanvas('#overlay');
  const databender = new Databender(audioCtx, overlayCanvas);
  loadTrack(audioCtx, databender);
  const upload = document.querySelector('.upload');
  var fileUpload = document.querySelector('input[type=file]');
  upload.ondragover = function () { this.classList.add('hover'); return false; };
  upload.ondragend = function () { this.classList.remove('hover'); return false; };
  upload.ondrop = function (e) {
    e.preventDefault();
    document.querySelector('.upload').style.display = 'none';
    var files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
    handleFileUpload(files[0], context, databender);
  }
  handleDatGUI(databender, audioCtx, context, overlayContext);
};

main();
