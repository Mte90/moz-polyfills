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

		var video = document.createElement("video");
		//video.style.visibility = 'hidden';
		var canvas = document.createElement("canvas");
		//canvas.style.visibility = 'hidden';

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
					console.log("An error occured! " + err);
				}
		);
		video.addEventListener('canplay', function(ev) {
			height = video.videoHeight / (video.videoWidth / 500);
			video.setAttribute('width', 500);
			video.setAttribute('height', 0);
			canvas.setAttribute('width', 500);
			canvas.setAttribute('height', 0);
		}, false);

		canvas.width = 500;
		canvas.height = 0;
		canvas.getContext('2d').drawImage(video, 0, 0, 500, 0);

		this.result = {
			blob: canvas.toDataURL('image/png')
		};

		if (this.onsuccess) {
			this.onsuccess();
		}

	}
};
window['MozActivity'].prototype = {
	constructor: window['MozActivity']
};

