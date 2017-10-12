function handleDatGUI(databender){
  var gui = new dat.GUI();
  Object.keys(databender.effects).forEach(function (effect) {
    if (effect === 'frameRate' || effect === 'sampleRate') { 
      gui.add(databender.effects, effect)
    } else if (effect === 'playAudio') {
      gui.add(databender.effects, effect)
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
      Object.keys(databender.effects[effect]).forEach(function (param) {
        effectTab.add(databender.effects[effect], param)            
        .onFinishChange(function (value) { 
          databender.bend(imageData).then(function (buffer) { 
            databender.draw(buffer, window.context); 
          });
          if (databender.effects.playAudio && (param === 'active' || (param !== 'active' && value))) {
            var bufferSource = audioCtx.createBufferSource();
            bufferSource.loop = true;
            databender.render(window.trackBuffer).then(function (buffer) { 
              if (window.prevBufferSource) {
                window.prevBufferSource.stop();
              }
              bufferSource.buffer = buffer;
              bufferSource.connect(audioCtx.destination);
              console.log(audioCtx.currentTime);
              bufferSource.start(audioCtx.currentTime);
              window.prevBufferSource = bufferSource;
            });
          }
        });
      });
    }
  });
};

function renderVideoToCanvas(v,c,w,h) {
  var timer;
  var time;

  function drawFrame(v,c,w,h) {
    if(v.paused || v.ended) return false;
    c.drawImage(v,0,0,w,h);
    window.imageData = c.getImageData(0,0,w,h);
    var databent = databender.bend(imageData).then(function(renderedBuffer) {
      databender.draw(renderedBuffer, c);
    });
  }

  (function repeat() {
    time = 1000 / databender.effects.frameRate;  
    drawFrame(v,c,w,h);
    timer = setTimeout(repeat, time);
  }());
}

function handleImageUpload (e) {
  var reader = new FileReader();
  var canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 768;
  window.context = canvas.getContext('2d');
  reader.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      window.context.drawImage(img, 0, 0, canvas.width, canvas.height);
      window.imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      databender.bend(imageData).then(function (buffer) { 
        databender.draw(buffer, context); 
      });
    };
    img.src = e.target.result;
  }
  reader.readAsDataURL(e);
}; 

function handleVideoUpload(e){
  var reader = new FileReader();
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var video = document.createElement('video');

  video.addEventListener('play', function () {
    renderVideoToCanvas(this, context, canvas.width, canvas.height);
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
        if (databender.effects.playAudio) {
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



function init () {
  hasGUI = false;
  loadTrack();
  audioCtx = new AudioContext();
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
  databender = new Databender(audioCtx);
  handleDatGUI(databender);
};

init();
