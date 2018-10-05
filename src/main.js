const { options, tools, effects } = require('./config');
const Databender = require('databender');
const dat = require('dat.gui');

function toggleAudio(value, audioCtx) { 
  if (!value) {
    const bufferSource = audioCtx.createBufferSource();
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
}

const handleMouseup = function (e) {
  if (!(e.clientX === startingPosition[0] && e.clientY === startingPosition[1])) { 
    isDragging = true
  } else {
    console.log('what happened');
  }
  isDragging = false;
  startingPosition = [];
}

function toggleTool(tool, value, canvas, context, databender, overlayContext, handlers) { 
  if (value) { 
    dispatchToolEventHandlers(tool, 'add', canvas, handlers);
  } else {
    dispatchToolEventHandlers(tool, 'remove', canvas, handlers);
  }
}

function setToolEventHandlers (events, canvas, operationFn, handlers) {
  return events.forEach((eventType) => 
    canvas[operationFn](eventType, handlers[`handle${eventType.charAt(0).toUpperCase()}${eventType.slice(1)}`]));
}

function dispatchToolEventHandlers(tool, operation, canvas, handlers) {
  const operationFn = `${operation}EventListener`;
  switch(tool) {
    case 'Brush':
      const brushEvents = ['mousedown', 'mousemove', 'mouseup'];
      setToolEventHandlers(brushEvents, canvas, operationFn, handlers)
      break;
    case 'Fill': 
      const fillEvents = ['click'];
      setToolEventHandlers(fillEvents, canvas, operationFn, handlers)
      break;
    default:
      throw new Error('That tool is somehow not defined');
  }
}

function handleDatGUI(databender, audioCtx, canvas, context, overlayContext) {
  const gui = new dat.GUI();
  const handlers = {
    handleClick: handleFill.bind(null, context, overlayContext, databender),
    handleMousedown,
    handleMousemove: handleMousemove.bind(null, context, overlayContext, databender),
    handleMouseup,
  }

  const optionsTab = gui.addFolder('Options');
  Object.keys(options).forEach(option => {
    const controller = optionsTab.add(options, option)

    if (option === 'playAudio') {
      controller.onFinishChange(value => toggleAudio(value, audioCtx))
    }
  });

  const toolsTab = gui.addFolder('Tools');

  Object.keys(tools).forEach(tool => {
    const toolTab  = toolsTab.addFolder(tool);
    Object.keys(tools[tool]).forEach(param => {
      const controller = toolTab.add(tools[tool], param).listen();

      if (param === 'active') {
        controller.onFinishChange(value => {
           Object.keys(tools).filter((t) => t !== tool).forEach((t) => {
             tools[t].active = false;
             dispatchToolEventHandlers(t, 'remove', canvas, handlers);
          });
          toggleTool(tool, value, canvas, context, databender, overlayContext, handlers)
        });
      }
    });
  });

  const effectsTab = gui.addFolder('Effects');
  Object.keys(effects).forEach(effect => {
    const effectTab = effectsTab.addFolder(effect);
    Object.keys(effects[effect]).forEach(function (param) {
      effectTab.add(effects[effect], param)            
      if (options.playAudio && (param === 'active' || (param !== 'active' && value))) {
        const bufferSource = audioCtx.createBufferSource();
        const boundRender = databender.render.bind(databender);
        bufferSource.loop = true;

        databender.boundRender(window.trackBuffer).then(function (buffer) { 
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
};

function renderVideoToCanvas(v, context, databender) {
  let timer;
  let time;

  function drawFrame() {
    if(v.paused || v.ended) return false;
    return databender.bend(v, context);
  }

  (function repeat() {
    time = 1000 / options.frameRate;  
    drawFrame(v, context);
    timer = setTimeout(repeat, time);
  }());
}

function handleImageUpload (e, context, databender) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = function () {
      return databender.bend(img, context)
    };
    img.src = e.target.result;
  }
  reader.readAsDataURL(e);
}; 

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
  }
  reader.readAsDataURL(e);
}

function loadTrack (audioCtx, databender) {
  fetch('sample.mp3')
    .then((response) => response.arrayBuffer())
    .then((buffer) => window.trackBuffer = buffer)
    .then((buffer) => {
      audioCtx.decodeAudioData(buffer).then((decodedData) => {
        databender.render(decodedData).then(buffer => { 
          const bufferSource = audioCtx.createBufferSource();
          bufferSource.buffer = buffer;
          bufferSource.connect(audioCtx.destination);
          if (options.playAudio) {
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
};

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
};

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
  const { size } = tools.Brush;
  const drawX = getDrawCoordinate(clientX, size);
  const drawY = getDrawCoordinate(clientY, size);
  const imageSubset = context.getImageData(drawX, drawY, size, size);

  databender.bend(imageSubset, overlayContext, 0, 0, drawX, drawY, size, size, size, size);
}

function handleFill(context, overlayContext, databender) {
  const { canvas } = context;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  databender.bend(imageData, overlayContext);
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
  }
}

function main () {
  const audioCtx = new AudioContext();
  const { canvas, context } = prepareCanvas('#canvas');
  const { canvas: overlayCanvas, context: overlayContext } = prepareCanvas('#overlay');
  const databender = new Databender(effects, audioCtx);
  loadTrack(audioCtx, databender);
  prepareUpload(context, databender);
  handleDatGUI(databender, audioCtx, canvas, context, overlayContext);
};

main();
