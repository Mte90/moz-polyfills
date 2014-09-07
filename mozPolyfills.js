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
    video.setAttribute('autoplay', true);
    video.style.visibility = 'hidden';
    var canvas = document.createElement("canvas");
    canvas.style.visibility = 'hidden';
    _body.appendChild(video);
    _body.appendChild(canvas);

    navigator.getMedia({video: true, audio: false},
    function(stream) {
      if (navigator.mozGetUserMedia) {
        video.src = window.URL.createObjectURL(stream);
      } else {
        video.src = window.webkitURL.createObjectURL(stream);
      }
      video.play();
    },
            function(err) {
              if (this.error) {
                this.error();
              }
            }
    , false);

    video.addEventListener('playing', function(ev) {

      if (_photo()) {
        this.result = {
          blob: dataURItoBlob(canvas.toDataURL('image/jpeg', 0.7))
        };

        if (this.onsuccess) {
          this.onsuccess();
          _body.removeChild(video);
          _body.removeChild(canvas);
        }
      }

    }.bind(this), false);

    function _photo() {
      try {
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      } catch (e) {
        if (e.name === "NS_ERROR_NOT_AVAILABLE") {
          alert('On Firefox this feature require a second execution');
          setTimeout(_photo, 400);
        } else {
          throw e;
        }
      }
      return true;
    }

  } else if (config.name === 'dial') {
    //fake dialing
    alert('Dialing with ' + config.data.number);
    this.onsuccess();
  } else if (config.name === 'new') {
    if (config.data.type === 'websms/sms') {
      //fake sms
      alert('New sms to ' + config.data.number);
    } else if (config.data.type === 'webcontacts/contact') {
      //fake sms
      contact = 'Contact: ' + config.data.params.givenName + ' ' + config.data.params.lastName;
      contact += '\nNumber: ' + config.data.params.tel + '\nEmail: ' + config.data.params.email;
      contact += '\nAddress: ' + config.data.params.address + '\nCompany: ' + config.data.params.company;
      contact += '\nNote: ' + config.data.params.note;
      alert(contact);
    } else if (config.data.type === 'mail') {
      //share url
      alert('Write email to: ' + config.data.url);
    }
    if (this.onsuccess) {
      this.onsuccess();
    }
  } else if (config.name === 'share') {
    if (config.data.type === '') {
      //share url
      alert('Share url: ' + config.data.url);
    } else {
      //Share file
      alert('File shared');
    }
    if (this.onsuccess) {
      this.onsuccess();
    }
  } else if (config.name === 'view') {
    if (config.data.type === 'url') {
      //share url
      alert('Open url to browser: ' + config.data.url);
    }
    if (this.onsuccess) {
      this.onsuccess();
    }
  } else if (config.name === 'save-bookmark') {
    if (config.data.type === 'url') {
      //share url
      alert('Save url ' + config.data.url + ' with name ' + config.data.name);
    }
    if (this.onsuccess) {
      this.onsuccess();
    }
  }
};
window['MozActivity'].prototype = {
  constructor: window['MozActivity']
};

//Source http://stackoverflow.com/a/11954337/1902215
function dataURItoBlob(dataURI, callback) {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}