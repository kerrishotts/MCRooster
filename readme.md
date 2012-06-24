# MCRooster README

Author: Kerri Shotts
License: MIT
Version: 1.0

## About MCRooster

MCRooster (short for Minecraft Rooster) is a simple app intended to be a simple example of various principles in mobile application development using PhoneGap, HTML5, JS, and CSS. At its simplest, the app tracks the time in a Minecraft game -- where a single day/night cycle lasts 20 minutes. 

The principles demonstrated include:

- Single CodeBase for Supported Platforms (WP7, iOS, Android)
- Handling WP7's lack of "touch" events
- Handling WP7's eccentric "XMLHttpRequest" object
- Targeting CSS for each platform
- Targeting CSS for orientation
- Some of my personal thoughts on best-practices when it comes to structuring the app, loading content, and more.

## Using MCRooster

Start the app, and wait for dawn to arrive in your Minecraft game. When it arrives, tap "Start" or "Tap me when dawn arrives…". Immediately the app should set the time to 06:00 hours and the sun should begin to rise. The colors of the sky and ground should also begin to brighten.

The app will then be sync'd to your instance of Minecraft. Should you need to reset the app, just tap on "reset" and the app will go back to 06:00 and allow you to tap "start" again when dawn arrives.

## Improvements You Could Make

- Add sounds… like a rooster crow when dawn arrives.
- Add a "pause" for when you step away from the computer.
- Add images for the sun and moon to make them more Minecraft-like.
- Add gradients/images to the sky and ground.
- Allow a specific time entry (for when you reset the time inside Minecraft).

## Cordova Version

As of the time of this writing (6/23/2012), the latest available release of Cordova was 1.8.1. While the project will likely compile against future versions without a problem, it is something to be aware of.

## Compiling for iOS

Create a new Cordova app and drag the "www" folder in. You can choose to create it as a reference or as a copy: either way will work.

Alter the cordova.plist file to disable the spinner and disable the webview bounce.

Build & run on a device or the simulator -- you should have the app correctly loaded.

## Compiling for Android

For Android you need to follow the quickstart guide to create an Android project. However, instead of pointing at index.html, point at index-android.html. Otherwise you'll end up loading the index.html file intended for iOS.

Either drag in the "www" directory, or link (ln -s ../../www .) to it to get it in the project.

No other changes to project settings should be necessary; the app should build and run in your emulator or device.

## Compiling for WP7

For WP7, create a new project from the 1.8.1 project template. Replace the "www" directory in your project with the "/www" directory. You can do this by using "mklink -d www ../../www" or simply by coping the "www" directory. Either way works.

Change MainPage.xaml's PGView startPageURI property to "/app/www/index-wp7.html". If you don't, you'll load the iOS libraries.

No further changes should be necessary; the app should build and run in your emulator or device.

## About the Structure

The structure of the project is as follows:

/android - all Android project files
/wp7     - all WP7 project files
/ios     - all iOS project files
/www     - our single "www" codebase project.

Our www directory is laid out as follows:

/www
  index.html                 - iOS index page
  index-wp7.html             - wp7 index page
  index-android.html         - Android index page
  /images                    - images
  /scripts                   - scripts, including cordova
    app.js                   - application
    framework.js             - our simple utility framework
    cordova-ios-1.8.1.js     - iOS cordova
    cordova-wp7-1.8.1.js     - wp7 cordova
    cordova-android-1.8.1.js - Android cordova
  /styles                    - Any styles
    base.css                 - basic styles
  /views                     - pages, screens, forms, etc.
    mainView.html            - the main display for the app
    mainView.js              - … and the associated code

