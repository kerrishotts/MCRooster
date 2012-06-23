/*
 * mainView's JS
 *
 * Author:  Kerri Shotts
 * License: MIT
 */

var APP = APP || {};

// create mainView's namespace
APP.mainView = APP.mainView || {};

// mainview's properties:
APP.mainView.time = 0;
APP.mainView.dawnStartedAt = 0;

// mainView's timer ids:
APP.mainView.timerId = -1;
APP.mainView.blinkCycle = 0;
APP.mainView.animationId = -1;

/**
 *
 * init will locate and store the various elements that belong
 * to mainView. It will also attach any necessary events (like
 * touchend) to buttons and the like.
 *
 * Finally, when finished, it sets the view's opacity to 1 so
 * that we get a nice fade in (if the browser supports it).
 *
 */
APP.mainView.init = function ()
{
    APP.mainView.element = document.getElementById ("mainView_html");
    APP.mainView.touchToStart = document.getElementById ("mainView_touch2start");
    APP.mainView.startButton = document.getElementById ("mainView_start");
    APP.mainView.resetButton = document.getElementById ("mainView_reset");
    APP.mainView.clockElement = document.getElementById ("mainView_clock");
    APP.mainView.groundElement = document.getElementById ("mainView_ground");
    APP.mainView.skyElement = document.getElementById ("mainView_sky");
    APP.mainView.sunElement = document.getElementById ("mainView_sun");
    APP.mainView.moonElement = document.getElementById ("mainView_moon");
    
    APP.FW.addEventListenerTo ( (APP.FW.platform=="unknown") ? "click": "touchend", APP.mainView.touchToStart, APP.mainView.startTime );
    APP.FW.addEventListenerTo ( (APP.FW.platform=="unknown") ? "click": "touchend", APP.mainView.startButton, APP.mainView.startTime );
    APP.FW.addEventListenerTo ( (APP.FW.platform=="unknown") ? "click": "touchend", APP.mainView.resetButton, APP.mainView.resetTime );
    
    APP.mainView.time = 0;
    
    APP.mainView.element.style.opacity = "1"; // fade the view in.
       
}

/**
 *
 * Resets time. Clears any timer ids, resets time to 0, an
 * displays the buttons that can start everything over again.
 *
 */
APP.mainView.resetTime = function ()
{
  clearInterval ( APP.mainView.timerId );
  clearInterval ( APP.mainView.clockTimerId );
  clearInterval ( APP.mainView.animationId );
  
  APP.mainView.time = 0;
  APP.mainView.updateClock();
  APP.mainView.updateDisplay();

  APP.mainView.startButton.style.display="block";
  APP.mainView.touchToStart.style.display="block";
  APP.mainView.touchToStart.style.opacity = 1;
}

/**
 *
 * Starts time. Records the time at which we were started in
 * milleseconds (/1000 to get seconds). Sets time to zero.
 * Creates our animation Ids. Finally, it hides our "start"
 * elements to prevent tapping them without an intervening
 * "reset" tap.
 *
 */
APP.mainView.startTime = function ()
{
  APP.mainView.dawnStartedAt = (new Date()).getTime() / 1000;
  APP.mainView.time = 0;
  
  APP.mainView.timerId = setInterval (APP.mainView.updateTime,100);
  APP.mainView.clockTimerId = setInterval (APP.mainView.updateClock,500);
  APP.mainView.animationId = setInterval (APP.mainView.updateDisplay,1000);

  APP.mainView.touchToStart.style.opacity = 0;
  APP.mainView.startButton.style.display="none";
  setTimeout ( function() { APP.mainView.touchToStart.style.display="none"; }, 255 );
}

/**
 *
 * Called roughly every 100ms to update the in-world time. Based on the current
 * time (in millseconds, divided down to seconds), we can get the delta value
 * between when we started and where we are now. Taking the remainder after
 * dividing by 1200 returns our in-world time.
 *
 */
APP.mainView.updateTime = function ()
{
  var theCurrentTime = (new Date()).getTime() / 1000;
  var theTimeDelta = theCurrentTime - APP.mainView.dawnStartedAt;
  var theTimeFactor = 1; 
  
  var theNewMinecraftTime = (theTimeDelta*theTimeFactor) % 1200;
  
  APP.mainView.time = theNewMinecraftTime;
}

/**
 *
 * Called at roughly every 500ms to update the clock located in the lower-right
 * portion of the screen. Converting from in-world time to real-world time
 * takes some fun math, which we do at the beginning of the funciton.
 *
 * While it is possible to display each and every minute as it occurs in-world,
 * it turns out that (to me, at least) this is disturbing visually. We divide
 * by 3, floor it, and then multiply again so that we only display minute
 * changes every 3 minutes.
 *
 * The final portion displays the clock and handles the ":" blink cycle.
 *
 */
APP.mainView.updateClock = function ()
{
  var theCurrentMCTime = APP.mainView.time;
  var theRealWorldHour = Math.floor((theCurrentMCTime * 72)/3600) + 6;
  if (theRealWorldHour > 23) { theRealWorldHour -= 24; }
  var theRealWorldMinute = Math.floor( (((theCurrentMCTime * 72)%3600)/60));
  
  // so that our minute isn't so disturbingly fast
  theRealWorldMinute = Math.floor ( theRealWorldMinute / 3 ) * 3;
  
  var theRealWorldHourString = ( theRealWorldHour < 10 ) ? "0" + theRealWorldHour : "" + theRealWorldHour;
  var theRealWorldMinuteString=(theRealWorldMinute< 10 ) ? "0"+theRealWorldMinute : "" + theRealWorldMinute;

  APP.mainView.blinkCycle = (APP.mainView.blinkCycle+1) % 2;
  APP.mainView.clockElement.innerHTML = theRealWorldHourString + 
                                        ((APP.mainView.blinkCycle<1) ? ":" : " ") + 
                                        theRealWorldMinuteString;
}

/**
 *
 * Called every second or so.
 *
 * Updates the position of the sun (or moon) as well as the color of
 * the sky and ground, based upon the current time.
 *
 * The sun and moon will slowly rise and fall over a set period of
 * time. We use Math.sin to calculate this. The sun rises and falls
 * over a period of 800 ticks, while the moon does the same in 400
 * ticks. This is to come close to the MineCraft day/night cycle
 * where night itself is only 7 minutes, while daylight (including
 * sunrise and sunset) is 13 minutes.
 *
 * Once the position of the sun and moon are set, we go about
 * calculating the color of the sky and ground. These are done
 * based on various ranges of ticks, as follows:
 *
 *      000 - 100:   Dawn.  Sky/Ground brighten slowly.
 *      100 - 700:   Day.   Sky/Ground maintain bright color.
 *      700 - 800:   Dusk.  Sky/Ground darken slowly.
 *      800 -1159:   Night. Sky/Ground maintain dark color.
 *
 * Color changes are ramped over a period of 100 steps based on
 * the original RGB triplets and their target triplets.
 *
 */
APP.mainView.updateDisplay = function ()
{
  var theSun = APP.mainView.sunElement;
  var theMoon = APP.mainView.moonElement;
  var theSky = APP.mainView.skyElement;
  var theGround = APP.mainView.groundElement;
  var theTime = APP.mainView.time;
  
  // calculate the position of the sun and moon according to the time of day
  if ( 0 < theTime && theTime < 800 )
  {
    // daytime sun cycle
    theSun.style.display = "block";
    theMoon.style.display = "none";
    theSun.style.top  = 43 - (Math.sin ( (theTime/(800/180)) * Math.PI/180 ) * 35) + "%";
    theMoon.style.top = "50%";
  }
  if ( 800 < theTime && theTime < 1200 )
  {
    // nighttime moon cycle
    theSun.style.display = "none";
    theMoon.style.display = "block";
    theMoon.style.top  = 43 - (Math.sin ( ((1200-theTime)/(400/180)) * Math.PI/180 ) * 35) + "%";
    theSun.style.top = "50%";
  }
  

  // calculate the colors of the sky and ground according to the time of day
  if ( 100 < theTime && theTime< 700 )
  {
    // daytime
    theSky.style.backgroundColor = "rgb(159, 217, 247)";
    theGround.style.backgroundColor = "rgb(32, 128, 64)";
  }
  else
  {
    // night time cycle
    if ( 0 < theTime && theTime < 100 ) // dawn
    {
      theSky.style.backgroundColor = "rgb(" +
                                     Math.floor( (theTime) * (159/100)) + "," +
                                     Math.floor( (theTime) * (217/100)) + "," +
                                     Math.floor( (theTime) * (215/100) +32) + ")";
      theGround.style.backgroundColor = "rgb(" +
                                     Math.floor( (theTime) * ( 32/100)) + "," +
                                     Math.floor( (theTime) * ( 96/100) +32) + "," +
                                     Math.floor( (theTime) * ( 48/100) +16) + ")";
    }
    if ( 700 < theTime && theTime < 800 ) // dusk
    {
      theSky.style.backgroundColor = "rgb(" +
                                     Math.floor( (800-theTime) * (159/100)) + "," +
                                     Math.floor( (800-theTime) * (217/100)) + "," +
                                     Math.floor( (800-theTime) * (215/100) +32) + ")";
      theGround.style.backgroundColor = "rgb(" +
                                     Math.floor( (800-theTime) * ( 32/100)) + "," +
                                     Math.floor( (800-theTime) * ( 96/100) +32) + "," +
                                     Math.floor( (800-theTime) * ( 48/100) +16) + ")";
    }
    if ( 800 < theTime && theTime < 1200 ) // dead-of-night
    {
      theSky.style.backgroundColor = "rgb(0,0,32)";
      theGround.style.backgroundColor = "rgb(0,32,16)";
    }
  }
}
