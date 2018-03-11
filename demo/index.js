function handleDatGUI(databender, canvas){
  var gui = new dat.GUI();
  Object.keys(databender.config).forEach(function (effect) {
    if (effect === 'frameRate' || effect === 'sampleRate') { 
      gui.add(databender.config, effect)
    } else if (effect === 'playAudio') {
      gui.add(databender.config, effect)
        .onFinishChange(function (value) {
          if (!value) {
            var bufferSource = audioCtx.createBufferSource();
            bufferSource.loop = true;
            databender.render(window.trackBuffer).then(function (buffer) { 
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
      Object.keys(databender.config[effect]).forEach(function (param) {
        effectTab.add(databender.config[effect], param)            
          .onFinishChange(function (value) { 
            databender.bend(databender.imageData)
              .then(databender.render.bind(databender))
              .then(databender.draw.bind(databender))
          });

        if (databender.config.playAudio && (param === 'active' || (param !== 'active' && value))) {
          var bufferSource = audioCtx.createBufferSource();
          bufferSource.loop = true;
          databender.render(window.trackBuffer).then(function (buffer) { 
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
    };
  });
};

function renderVideoToCanvas(v, renderCanvas) {
  var timer;
  var time;

  function drawFrame(v, renderCanvas) {
    if(v.paused || v.ended) return false;
    var databent = databender.bend(v)
      .then(databender.render.bind(databender))
      .then(databender.draw.bind(databender))
  }

  (function repeat() {
    time = 1000 / databender.config.frameRate;  
    drawFrame(v, renderCanvas);
    timer = setTimeout(repeat, time);
  }());
}

function handleImageUpload (e, renderCanvas) {
  var reader = new FileReader();
  reader.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      databender.bend(img)
        .then(databender.render.bind(databender))
        .then(databender.draw.bind(databender));
    };
    img.src = e.target.result;
  }
  reader.readAsDataURL(e);
}; 

function handleVideoUpload(e, renderCanvas){
  var reader = new FileReader();
  var video = document.createElement('video');

  video.addEventListener('play', function () {
    renderVideoToCanvas(this);
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

function loadTrack () {
  var url = 'sample.mp3';
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  // Decode asynchronously
  request.onload = function() {
    var bufferSource = audioCtx.createBufferSource();
    bufferSource.loop = true;
    audioCtx.decodeAudioData(request.response, function (buffer) { 
      window.trackBuffer = buffer;
      databender.render(window.trackBuffer).then(function (buffer) { 
        bufferSource.buffer = buffer;
        bufferSource.connect(audioCtx.destination);
        if (databender.config.playAudio) {
          bufferSource.start(0);
        }
        window.prevBufferSource = bufferSource; 
      });
    });
  };
  request.send();
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


function handleFileUpload(file) {
  var type = getFileType(file);
  switch (type) { 
    case 'image': 
      return handleImageUpload(file);
    case 'video':
      return handleVideoUpload(file);
    default:
      alert('File Type is not supported');
      return false;
  }
};

function main () {
  loadTrack();
  audioCtx = new AudioContext();
  var renderCanvas = document.querySelector('#canvas');
  var upload = document.querySelector('.upload');
  var fileUpload = document.querySelector('input[type=file]');
  upload.ondragover = function () { this.classList.add('hover'); return false; };
  upload.ondragend = function () { this.classList.remove('hover'); return false; };
  upload.ondrop = function (e) {
    e.preventDefault();
    document.querySelector('.upload').style.display = 'none';
    var files = e.target.files || (e.dataTransfer && e.dataTransfer.files);
    handleFileUpload(files[0]);
  }
  databender = new Databender(audioCtx, renderCanvas);
  handleDatGUI(databender, renderCanvas);
};

main();
