if (!navigator['mozSetMessageHandler']) {
  navigator['mozSetMessageHandler'] = function(activity, callback) {
    if (activity === 'open') {
      // TODO
      return false;
    }
  };
}
//Alarm support
if (!navigator.mozAlarms) {
  navigator.mozAlarms = function() {
    alertConsole('Alarm called');
    return false;
  };
  navigator.mozAlarms.add = function(date, type, data) {
    alertConsole('Alarm added ' + type);
    return false;
  };
  navigator.mozAlarms.getAll = function() {
    alertConsole('Alarm get all');
    return false;
  };
  navigator.mozAlarms.remove = function(name) {
    alertConsole('Alarm remove');
    return false;
  };
}
//DeviceStorage support - WIP

if (!navigator.getDeviceStorage) {
  navigator.getDeviceStorage = function(type) {
    this.filetype = type;
    if (this.filetype === "pictures") {
      this.filetype = "image/*";
    }
    //Create input element
    this.input = document.createElement('input');
    //Set type file for the input
    this.input.type = 'file';
    //Multiple support
    this.input.multiple = 'multiple';
    //Pass the mime type to the input element
    this.input.accept = this.filetype;
    alertConsole('getDeviceStorage ' + this.filetype);
    this.input.addEventListener('change', function(e) {
      console.log(e.target.files)
      if (this.onsuccess) {
        this.onsuccess();
      }
      return {result: e.target.files};
    }.bind(this), false);
        
    this.enumerate = function() {
      //Open the file picker
      this.input.click();
      return false;
    };
    
    return this;

  };
}
//Vibrate polyfill - https://github.com/codepo8/vibrate-polyfill/
//Author Christian Heilmann
if (!isMobile() || !navigator.vibrate) {
  var _s = document.createElement('style');
  _s.innerHTML = 'body.buzz {animation: buzz 100ms infinite;-webkit-animation: buzz 100ms infinite;}@keyframes buzz {0% {margin: 10px;}50% {margin: 12px 12px;}75% {margin: 10px;}100% {margin: 8px 8px;}}@-webkit-keyframes buzz {0% {margin: 10px;}50% {margin: 12px 12px;}75% {margin: 10px;}100% {margin: 8px 8px;}}';
  document.getElementsByTagName('head')[0].appendChild(_s);
  navigator.vibrate = function(duration) {
    if (!duration) {
      clearTimeout(navigator.vibrate.current);
      navigator.vibrate.duration = [];
      navigator.vibrate.stop();
    }
    if (typeof duration === 'object' && duration.length) {
    } else {
      duration = [duration];
    }
    navigator.vibrate.count = 0;
    navigator.vibrate.duration = duration;
    navigator.vibrate.buzz();
  };
  navigator.vibrate.buzz = function() {
    if (navigator.vibrate.current) {
      clearTimeout(navigator.vibrate.current);
    }
    document.body.className += ' buzz';
    navigator.vibrate.current = window.setTimeout(
            navigator.vibrate.stop,
            navigator.vibrate.duration[navigator.vibrate.count]
            );
  };
  navigator.vibrate.stop = function() {
    if (navigator.vibrate.current) {
      clearTimeout(navigator.vibrate.current);
    }
    document.body.className = document.body.className.replace(' buzz', '');
    if (navigator.vibrate.duration[navigator.vibrate.count + 1]) {
      navigator.vibrate.current = window.setTimeout(
              navigator.vibrate.buzz,
              navigator.vibrate.duration[navigator.vibrate.count + 1]
              );
    }
    navigator.vibrate.count += 2;
  };
}
//Connection support
if (!isMobile() || (!navigator.connection || navigator.mozConnection || navigator.webkitConnection)) {
  navigator.connection = {UNKNOWN: true, type: 0};
  navigator.mozConnection = {UNKNOWN: true, type: 0};
  navigator.webkitConnection = {UNKNOWN: true, type: 0};
}
//Keep screen support - API only of Gecko
if (!navigator.requestWakeLock) {
  navigator.requestWakeLock = function() {
    alertConsole('Wake lock called');
    return false;
  };
}
//Lock orientation support
if (!screen.mozLockOrientation) {
  //Ie support this API
  if (screen.msLockOrientation) {
    screen.mozLockOrientation = screen.msLockOrientation;
  } else {
    screen.mozLockOrientation = function(mode) {
      alertConsole('Lock orientation called');
      return false;
    };
  }
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
 * @param config config for the webactivity
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
    if (config.data.type === '' || config.data.url !== '') {
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

//IsMobile based on detectmobilebrowsers.com
function isMobile() {
  var check = false;
  (function(a) {
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}
