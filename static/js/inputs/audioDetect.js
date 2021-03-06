window.AudioContext = window.AudioContext || window.webkitAudioContext;


var audioContext = new AudioContext();
var sourceNode = null;
var analyser = null;
var aLotOfNoise = false;

window.onload = function() {
  getUserMedia({audio:true}, gotStream);
}

function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect( analyser );
    updateAudioBar();
}

var rafID = null;
var buflen = 2048;
var buf = new Uint8Array( buflen );


function autoCorrelate( buf, sampleRate ) {
  var MIN_SAMPLES = 4;  // corresponds to an 11kHz signal
  var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
  var SIZE = 1000;
  var rms = 0;

  confidence = 0;
  currentPitch = 0;

  if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
    return;  // Not enough data

  for (var i=0;i<SIZE;i++) {
    var val = (buf[i] - 128)/128;
    rms += val*val;
  }
  rms = Math.sqrt(rms/SIZE);
  return rms;
}

function updateAudioBar( time ) {
  var cycles = new Array;
  analyser.getByteTimeDomainData( buf );

  var height = 600 - (autoCorrelate( buf, audioContext.sampleRate ) * 600);

  if(height <= 600) {
    $(".audioVolume").css( "background-color", "yellow");
    aLotOfNoise = false;
  }
  if(height <= 300) {
    $(".audioVolume").css( "background-color", "orange");
    aLotOfNoise = false;
  }
  if(height <= 100) {
    $(".audioVolume").css( "background-color", "red");
    aLotOfNoise = true;
  }
  $(".audioBar").css( "height", height + "px");

  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  rafID = window.requestAnimationFrame( updateAudioBar );
}

var AudioIn = function() {

}

AudioIn.prototype.fetch = function() {
  return aLotOfNoise;
}
