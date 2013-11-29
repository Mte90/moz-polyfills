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

			if(typeof config.data !== 'undefined') {
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
	}
};
window['MozActivity'].prototype = {
	constructor: window['MozActivity']
};

