Demo: http://mte90.github.io/moz-polyfills/
#Browser supported

Browser used for the develop of the polyfill are Chromium 31 and Firefox 32

#Polyfyll supported

The plain for this polyfill is support the [FirefoxOS BoilerPlate App](https://github.com/robnyman/Firefox-OS-Boilerplate-App) (to start)

* Pick image (support for multiple image missing)
* Dial (open an alert)
* New Contact (open an alert)
* Share Url (open an alert)
* Share file (open a blob in a new page)
* Show Url (open an alert)
* Open Url (open an alert)
* Write email (open the email software)
* Save Bookmark (save the bookmark)
* Record (on Firefox there is a bug that require a 2nd execution)
* Open file (open the file in a new page)

#Console or Alert?

    var MozPolyfills = 'alert';
or
    var MozPolyfills = 'console';

#Roadmap

* Alarm support
* Orientation info
* Proximity support
* Ambient Light support
* Vibration support
* Hold rotation support
* Share photo open a small popup customizable with custom code
* Mark all the button with Polyfill

#Credits

* Mte90
* SunboX (the initial code and first pick image code)

All polyfills are MIT certified.
