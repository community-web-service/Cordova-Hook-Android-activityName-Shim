# Cordova-Hook-android-activityName-Shim
Android-activityName Shim is a Cordova hook that adds support for "android-activityName" to versions of Cordova prior to 5.0.0

# Installation
Place cordova-hook-android-activityname-shim.js in your Cordova project and add '&lt;hook type="after_prepare" src="/path/to/cordova-hook-android-activityname-shim.js" /&gt;' to config.xml. Do not add the hook as a child of any platform tags; Cordova will not tigger platform specific hooks unless the platform is explicitly included with a command (e.g. '$ cordova prepare android').

# Todo
* Roll back changes on error.
* More elegantly handle errors.
* Test with all supported versions of Cordova.
