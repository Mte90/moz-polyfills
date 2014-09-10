if (!navigator['mozSetMessageHandler']) {
  navigator['mozSetMessageHandler'] = function(activity, callback) {
    if (activity === 'open') {
      // TODO
      return false;
    }
  };
}
if (!navigator['mozAlarms']) {
  navigator['mozAlarms'] = function(callback) {
    alertConsole('Alarm called');
    return false;
  };
  navigator['mozAlarms'].add = function(callback) {
    alertConsole('Alarm added');
    return false;
  };
  navigator['mozAlarms'].getAll = function(callback) {
    alertConsole('Alarm get all');
    return false;
  };
  navigator['mozAlarms'].remove = function(callback) {
    alertConsole('Alarm remove');
    return false;
  };
}

function alertConsole(string) {
  if (MozPolyfills === 'alert') {
    alert(string);
  } else if (MozPolyfills === 'console') {
    console.log(string);
  }
}

/**
 * Load fake WebActivity
 * @constructor
 * @param {config} the config for the webactivity
 */

window['MozActivity'] = function(config) {
  //Pick image
  if (config.name === 'pick') {
    //Create input element
    input = document.createElement('input');
    //Set type file for the input
    input.type = 'file';
    //Pass the mime type to the input element
    if (config.data && config.data.type) {
      input.accept = config.data.type.join();
    }
    input.addEventListener('change', function(e) {
      files = e.target.files; // FileList object
      //Check if empty
      if (files.length === 0) {
        return;
      }
      //Check data if exist
      if (typeof config.data !== 'undefined') {
        //Check mimetype
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
    //Open the file picker
    input.click();
  } //Capture a photo
  else if (config.name === 'record') {
    //GetUserMedia polyfill
    navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    var _body = document.getElementsByTagName('body')[0];
    //Create a temporary video tag
    var _video = document.createElement("video");
    _video.setAttribute('autoplay', true);
    _video.style.visibility = 'hidden';
    //Create a temporary canvas tag
    var _canvas = document.createElement("canvas");
    _canvas.style.visibility = 'hidden';
    _body.appendChild(_video);
    _body.appendChild(_canvas);
    //getUserMedia wrapper
    navigator.getMedia({video: true, audio: false},
    function(stream) {
      if (navigator.mozGetUserMedia) {
        _video.src = window.URL.createObjectURL(stream);
      } else {
        _video.src = window.webkitURL.createObjectURL(stream);
      }
      _video.play();
    },
            function(err) {
              console.log(err);
              if (this.error) {
                this.error();
              }
            }
    , false);
    //Event on video start
    _video.addEventListener('playing', function(ev) {
      //Call a wrapper for take a photo
      if (_photo()) {
        this.result = {
          //Canvas to Blob in jpg format to 0.7 compression
          blob: dataURItoBlob(_canvas.toDataURL('image/jpeg', 0.7))
        };

        if (this.onsuccess) {
          this.onsuccess();
          //Remove the video and canvas element
          _body.removeChild(_video);
          _body.removeChild(_canvas);
        }
      }
    }.bind(this), false);
    //Wrapper for https://bugzilla.mozilla.org/show_bug.cgi?id=879717
    function _photo() {
      try {
        _canvas.width = _video.clientWidth;
        _canvas.height = _video.clientHeight;
        //Draw the video frame in the canvas
        _canvas.getContext('2d').drawImage(_video, 0, 0, _video.videoWidth, _video.videoHeight);
      } catch (e) {
        if (e.name === "NS_ERROR_NOT_AVAILABLE") {
          alertConsole('On Firefox this feature require a second execution');
          console.log('Bug #879717 Firefox drawimage on mediastream - https://github.com/Mte90/moz-polyfills/issues/1');
          setTimeout(_photo, 400);
        } else {
          throw e;
        }
      }
      return true;
    }
  } //Dial picker
  else if (config.name === 'dial') {
    alertConsole('Dialing with ' + config.data.number);
    this.onsuccess();
  } //Wrapper for new data
  else if (config.name === 'new') {
    //Fake SMS
    if (config.data.type === 'websms/sms') {
      alertConsole('New sms to ' + config.data.number);
    } //Fake Contact
    else if (config.data.type === 'webcontacts/contact') {
      contact = 'Contact: ' + config.data.params.givenName + ' ' + config.data.params.lastName;
      contact += '\nNumber: ' + config.data.params.tel + '\nEmail: ' + config.data.params.email;
      contact += '\nAddress: ' + config.data.params.address + '\nCompany: ' + config.data.params.company;
      contact += '\nNote: ' + config.data.params.note;
      alert(contact);
    } //Compose email
    else if (config.data.type === 'mail') {
      var _win = window.open("mailto:" + config.data.url, '_blank');
      _win.focus();
    }
    if (this.onsuccess) {
      this.onsuccess();
    }
  } //Share website
  else if (config.name === 'share') {
    //Shared an URL
    if (config.data.type === '') {
      alertConsole('Share url: ' + config.data.url);
    } else {
      //Share blob in a new page
      var _win = window.open(window.URL.createObjectURL(config.data.blobs[0]), '_blank');
      _win.focus();
    }
    if (this.onsuccess) {
      this.onsuccess();
    }
  }
  else if (config.name === 'view') {
    //Open a page
    if (config.data.type === 'url') {
      var _win = window.open(config.data.url, '_blank');
      _win.focus();
    }
    if (this.onsuccess) {
      this.onsuccess();
    }
  } //Save the bookmark
  else if (config.name === 'save-bookmark') {
    if (config.data.type === 'url') {
      if (window.sidebar && window.sidebar.addPanel) { // Mozilla Firefox Bookmark
        window.sidebar.addPanel(config.data.name, config.data.url, '');
      } else if (window.external && ('AddFavorite' in window.external)) { // IE Favorite
        window.external.AddFavorite(config.data.url, config.data.name);
      } else { // webkit - safari/chrome
        alertConsole('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') !== -1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
      }
    }
    if (this.onsuccess) {
      this.onsuccess();
    }
  } //Open file in a new page
  else if (config.name === 'open') {
    var _win = window.open(config.data.url, '_blank');
    _win.focus();

    if (this.onsuccess) {
      this.onsuccess();
    }
  }
};
window['MozActivity'].prototype = {
  constructor: window['MozActivity']
};

//Convert data in a blob
//Source http://stackoverflow.com/a/11954337/1902215
function dataURItoBlob(dataURI, callback) {
  var binary = atob(dataURI.split(',')[1]);
  var array = [];
  for (var i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}