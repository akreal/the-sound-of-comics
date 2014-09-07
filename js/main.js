function midiMessageReceived( ev ) {
	var cmd = ev.data[0] >> 4;
	var channel = ev.data[0] & 0xf;
	var noteNumber = ev.data[1];
	var velocity = ev.data[2];

	if (channel == 9)
		return
	if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { // with MIDI, note on with velocity zero is the same as note off
		// note off
		noteOff( noteNumber );
	}
	else if (cmd == 9) {
		// note on
		noteOn( noteNumber );
	}
}

var midiIn = null;
var buffers = new Array();
var images = new Array();
var started = false;

var sounds = [
'Letters/B.webm',
'Letters/E.webm',
'Letters/R.webm',
'Letters/L.webm',
'Letters/I.webm',
'Letters/N.webm',
'Letters/Oh.webm',
'Sounds/BassDrum.webm',
'Sounds/Snare.webm',
'Sounds/Tap1 BR.webm',
'Sounds/Tap2 BR.webm',
'Sounds/Tap3 BR.webm',
'Sounds/Berl Clap1.webm',
'Sounds/Berl Git1.webm',
'Sounds/Bass_c.webm',
'Sounds/Brass1.webm',
'Sounds/Brass2.webm',
'Sounds/AmpMove1 BR.webm',
'Sounds/AmpMove2 BR.webm',
'Sounds/AmpMove3 BR.webm',
'Sounds/AmpMove4 BR.webm',
'Sounds/AmpMove5 BR.webm',
];

var animations = [
'img/B.png',
'img/E.png',
'img/R.png',
'img/L.png',
'img/I.png',
'img/N.png',
'img/Ooh.png',
'img/BassDrum2.png',
'img/BassDrum1.png',
'img/Snare2.png',
'img/Snare1.png',
'img/Uh2.png',
'img/Uh1.png',
'img/Clap2.png',
'img/Clap1.png',
'img/Guitar2.png',
'img/Guitar1.png',
'img/Bass2.png',
'img/Bass1.png',
'img/Amp1_2.png',
'img/Amp1_1.png',
'img/AmpMove1.png',
'img/AmpMove2.png',
'img/AmpMove3.png',
'img/AmpMove4.png',
'img/AmpMove5.png',
];

var defaultImage = null;

var noteMap = {
49: [0, [0]],
51: [1, [1]],
54: [2, [2]],
56: [3, [3]],
58: [4, [4]],
61: [5, [5]],
66: [6, [6]],
68: [7, [8,7]],
70: [8, [10,9]],
48: [9, [12,11]],
50: [10, [12,11]],
52: [11, [12,11]],
53: [12, [14,13]],
55: [13, [16,15]],
57: [14, [18,17]],
60: [15, [20,19]],
62: [16, [20,19]],
64: [17, [21]],
65: [18, [22]],
67: [19, [23]],
69: [20, [24]],
71: [21, [25]],
};

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

function getSound(index) {
	var request = new XMLHttpRequest();
	request.open('GET', sounds[index], true);
	request.responseType = 'arraybuffer';

	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {
													buffers[index] = buffer;
													if (index < sounds.length - 1) {
														getSound(index + 1);
													}
												}
		);
	}

	request.send();
}

function playVideo() {
	document.getElementById('img').style.display = 'none';
	document.getElementById('video').style.display = 'block';
	document.getElementById('film').play();
}

function onMIDIStarted( midi ) {
	getSound(0);

	defaultImage = document.getElementById('main').src;

	for (var i = 0; i < animations.length; i++) {
		images[i] = document.createElement('img');
		images[i].src = animations[i];
	}

	midiAccess = midi;
    midiIn = midiAccess.inputs()[0];
	midiIn.onmidimessage = midiMessageReceived;
}

function onMIDISystemError( err ) {
	console.log( "MIDI not initialized - error encountered:" + err.code );
}

function noteOn( noteNumber ) {
	if (noteNumber == 72) {
		playVideo();
	}
	else {
		if (m = noteMap[noteNumber]) {
			var source = context.createBufferSource();
			source.buffer = buffers[m[0]];
			source.connect(context.destination);
			document.getElementById('main').src = images[m[1][0]].src;
			started = true;
			source.start(0);
			eval('source.onended = function () { if (started) { var im = ' + m[1][1] + '; if (im != null) { document.getElementById(\'main\').src = images[im].src;} } started = false; }');
		}
		else {
			console.log(noteNumber);
		}
	}
}

function noteOff( noteNumber ) {
}

window.addEventListener('load', function() {   
	if (navigator.requestMIDIAccess)
		navigator.requestMIDIAccess().then( onMIDIStarted, onMIDISystemError );
});
