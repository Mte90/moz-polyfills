if (!navigator['mozSetMessageHandler']) {
	navigator['mozSetMessageHandler'] = function(activity, callback) {
		if (activity === 'open') {
			// TODO
			return false;
		}
	};
}

/**
 * Load fake WebActivity
 * @constructor
 * @param {config} the config for the webactivity
 */

window['MozActivity'] = function(config) {
	//pick image
	if (config.name === 'pick') {
		input = document.createElement('input');
		input.type = 'file';
		if (config.data && config.data.type) {
			input.accept = config.data.type.join();
		}
		input.addEventListener('change', function(e) {
			files = e.target.files; // FileList object

			if (files.length === 0) {
				return;
			}

			if (typeof config.data !== 'undefined') {
				//check mimetype
				if (typeof config.data.type !== 'undefined') {
					if (files[0].type !== '' && config.data.type.indexOf(files[0].type) < 0) {
						return;
					}
				}
			}

			this.result = {
				blob: files[0]
			};

			if (this.onsuccess) {
				this.onsuccess();
			}

		}.bind(this), false);

		input.click();
	} else if (config.name === 'record') {
		navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

		var _body = document.getElementsByTagName('body')[0];
		var video = document.createElement("video");
		video.style.visibility = 'hidden';
		var canvas = document.createElement("canvas");
		canvas.style.visibility = 'hidden';
		_body.appendChild(video);
		_body.appendChild(canvas);

		navigator.getMedia({video: true, audio: false},
		function(stream) {
			if (navigator.mozGetUserMedia) {
				video.mozSrcObject = stream;
			} else {
				var vendorURL = window.URL || window.webkitURL;
				video.src = vendorURL.createObjectURL(stream);
			}
			video.play();
		},
				function(err) {
					if (this.error) {
						this.error();
					}
				}
		);
		video.addEventListener('canplay', function(ev) {
			height = video.videoHeight / (video.videoWidth / 500);
			video.setAttribute('width', 500);
			video.setAttribute('height', height);
			canvas.setAttribute('width', 500);
			canvas.setAttribute('height', height);
			canvas.getContext('2d').drawImage(video, 0, 0, 500, height);

			this.result = {
				blob: canvas.toDataURL()
			};

			if (this.onsuccess) {
				this.onsuccess();
				_body.removeChild(video);
				_body.removeChild(canvas);
			}

		}.bind(this), false);
	}
};
window['MozActivity'].prototype = {
	constructor: window['MozActivity']
};

