/*
Copyright 2015 Robert M. V. Gaines

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

/**
 * @name Cordova Hook android-activityName Shim
 * @version 0.1.0
 * @author rmvgaines@rgaineswebdevelopment.com (Robert M. V. Gaines)
 * @copyright Copyright 2015 Robert M. V. Gaines
 * @license <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache 2.0</a>
 * @fileoverview Cordova hook based shim that adds support, to versions of Cordova prior to version 5.0.0, for the "android-activityName" attribute of the "widget" tag found in a project's "config.xml". Install by placing this file inside of your Cordova project and adding "<hook type='after_prepare' src='res/hooks/cordova-android-activityname-shim-hook/cordova-android-activityname-shim-hook.js' /> as a child of the "widget" tag in your project's "config.xml" file. Do not add the hook for specific platforms; certain Cordova commands do not trigger hooks specified under specific platforms, unless the command specifies the platform as an argument (e.g. $ cordova prepare android).
 * @todo Roll back changes on error.
 * @todo More elegantly handle errors.
 * @requires fs
 * @requires path
 * @requires cordova-lib/src/cordova/util
 * @requires cordova-lib/src/util/xml-helpers
 */

/*jslint node: true */
/*jshint node: true */

/**
 * @module
 */

 /**
 * @method exports
 * @desc Mimics Cordova ^5.0.0 default handling of the "android-activityName" attribute of the "widget" tag found in a project's "config.xml".
 * @since 0.1.0
 * @param {Object} context Standard Cordova Context object, passed from Cordova to Javascript hooks.
 * @return {boolean} 0 on success or 1 on fatal error.
 * @requires fs
 * @requires path
 * @requires cordova-lib/src/cordova/util
 * @requires cordova-lib/src/util/xml-helpers
 */
module.exports = function (context) {
	'use strict';
	console.log('Running: Cordova android-activityName Shim');
	var isAndroid = context.opts.cordova.platforms.indexOf('android') > -1 || (!context.opts.cordova.platforms.length && context.opts.platforms.indexOf('android') > -1), //True if Android has been specified as a platform argument for prepare or if Android is an installed platform and no platform arguments were specified for prepare. TLDR: True if Android has been prepared.
		cordovaVersion = context.opts.cordova.version.split('.')[0]; //First digit of Cordova's version.
	if (+cordovaVersion > 4 || !isAndroid) { //Current Cordova version handles android-activityName or the Android platform has not been prepared; the shim is not needed.
		console.log('The Cordova android-activityName Shim is not needed.');
		return 0;
	}
	var fs = require('fs'),
		path = require('path'),
		cordovaUtil = context.requireCordovaModule('cordova-lib/src/cordova/util'),
		xmlHelpers = context.requireCordovaModule('cordova-lib/src/util/xml-helpers'),
		projectRoot = context.opts.projectRoot, //Path to project's root directory.
		androidPlatformPath = path.join(projectRoot, 'platforms/android'), //Path to the project's android platform directory.
		androidManifestPath = path.join(androidPlatformPath, 'AndroidManifest.xml'), //Path to the project's AndroidManifest.xml
		projectConfigRoot = xmlHelpers.parseElementtreeSync(cordovaUtil.projectConfig(projectRoot)).getroot(), //Root element of the project's config.xml file as an Elementtree object.
		androidActivityName = projectConfigRoot.attrib['android-activityName'] || null, //"android-activityName" attribute of the "widget" tag in projectRoot\config.xml
		androidPackageName = projectConfigRoot.attrib['android-packageName'] || projectConfigRoot.attrib.id || null, //"android-packageName" attribute of the "widget" tag in projectRoot\config.xml
		activityNameJavaSrcPath = path.join(androidPlatformPath, "src", androidPackageName.replace(/\./g, '\\')), //Path to androidPlatformPath\src\TLD\domain\appName\ 
		defaultActivityName = xmlHelpers.parseElementtreeSync(androidManifestPath).findall('.//activity/[@android:name]').map(function (activityTag) {
			if (activityTag.find(".//action[@android:name='android.intent.action.MAIN']") !== null) {
				return activityTag.attrib['android:name'];
			} else {
				return null;
			}
		}).filter(function (activityName) {
			return Boolean(activityName);
		})[0] || null; // "android:name" attribute from the activity tag in androidPlatformPath\AndroidManifest.xml that contains the main activity.

	 /**
	 * @function fileStringReplaceSync
	 * @desc Replace all instances of a string within a file.
	 * @since 0.1.0
	 * @protected
	 * @param {string} filePath Path to the file upon which the operation will be performed.
	 * @param {string} oldString String to be replaced with newString.
	 * @param {string} newString String that replaces oldString.
	 * @return {boolean} 0 on success or 1 on fatal error.
	 * @requires fs
	 */
	function fileStringReplaceSync(filePath, oldString, newString) {
		var data = null;
		oldString = new RegExp(oldString, 'g');
		try {
			data = fs.readFileSync(filePath, 'utf8').replace(oldString, newString);
			fs.writeFileSync(filePath, data, 'utf8');
		} catch (err) {
			console.log('Cordova android-activityName Shim encountered an error.');
			console.log('Error: ', err);
			return err;
		}
		return 0;
	}
	
	if (!androidPackageName) { //"android-packageName" is not specified; throw a fatal error.
		console.log('Cordova android-activityName Shim encountered an error.');
		console.log('Error: Could not determine android-packageName');
		return 1;
	}
	if (!androidActivityName || !defaultActivityName || androidActivityName === defaultActivityName) { //"android-activityName" is not specified, "android:name" is not specified, or "android:name" is already set to "android-activityName"; Use Cordova's default behavior.
		console.log('Default Cordova  behavior is being used.');
		return 0;
	}
	//Replace references to defaultActivityName with androidActivityName in androidPlatformPath\src\TLD\domain\appName\defaultActivityName.java
	if (fileStringReplaceSync(path.join(activityNameJavaSrcPath, defaultActivityName + '.java'), defaultActivityName, androidActivityName)) { //An error was encountered.
		return 1;
	}
	//Rename androidPlatformPath\src\TLD\domain\appName\defaultActivityName.java to androidPlatformPath\src\TLD\domain\appName\androidActivityName.java
	try {
		fs.renameSync(path.join(activityNameJavaSrcPath, defaultActivityName + '.java'), path.join(activityNameJavaSrcPath, androidActivityName + '.java'));
	} catch (err) { //An error was encountered.
		console.log('Cordova android-activityName Shim encountered an error.');
		console.log('Error: ', err);
		return 1;
	}
	//Replace references to defaultActivityName with androidActivityName in androidPlatformPath\AndroidManifest.xml
	if (fileStringReplaceSync(androidManifestPath, defaultActivityName, androidActivityName)) { //An error was encountered.
		return 1;
	}
	console.log('android-activityName has been changed from ' + defaultActivityName + ' to ' + androidActivityName);
	return 0;
};
