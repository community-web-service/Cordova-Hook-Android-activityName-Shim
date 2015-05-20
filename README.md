# Cordova-Hook-android-activityName-Shim
Cordova hook based shim that adds support, to versions of Cordova prior to version 5.0.0, for the "android-activityName" attribute of the "widget" tag found in a project's "config.xml".

# Installation
Install by placing this file inside of your Cordova project and adding "<hook type='after_prepare' src='res/hooks/cordova-android-activityname-shim-hook/cordova-android-activityname-shim-hook.js' /> as a child of the "widget" tag in your project's "config.xml" file. Do not add the hook for specific platforms; certain Cordova commands do not trigger hooks specified under specific platforms, unless the command specifies the platform as an argument (e.g. $ cordova prepare android).

# Todo
Roll back changes on error.
More elegantly handle errors.
