/*
 * mainView's JS
 */
 
// notes on Minecraft time from the wiki:
//    Day lasts 10 minutes
//    Dusk lasts 1.5 minutes
//    Night lasts 7 minutes
//    Dawn lasts 1.5 minutes
//
// Notes on how /we/ calculate time
//   The total cycle takes 20 minutes from start to finish.
//   Assuming that we don't care about Dusk/Dawn differentiation
//   we can say that both Day and Night are 10 minutes long. 
//
//   Let's say, just for the fun of it, that Day occupies 6am to 6pm.
//   Night occupies the remainder. Using a 24-hour clock, day would
//   be 0600 to 1759, whilst night would be 1800-2359, and 0000-0559.
//
//   To make our internal calculations easier, we'll use a single
//   clock variable. Time from 0 - 599 indicates daylight, and 
//   600-1199 will indicate nighttime. Each second we can add "1"
//   to our clock to determine the time.
//
//   To convert, this function will be used
//       ((MCTIME * 72) / 3600) + 6 = hour of day; if >=24, - 24.
//       ((MCTIME * 72) % 3600) / 60 = minute of day
//
//   We can't assume our interval will be called /every/ second,
//   on-the-dot. So we must take the time it is now and subtract
//   from it the time recorded when dawn was noticed. 
 
var APP = APP || {};
APP.mainView = APP.mainView || {};

APP.mainView.time = 0;
APP.mainView.dawnStartedAt = 0;
APP.mainView.timerId = -1;
APP.mainView.blinkCycle = 0;
APP.mainView.animationId = -1;

APP.mainView.init = function ()
{
    APP.mainView.element = document.getElementById ("mainView_html");
    APP.mainView.touchToStart = document.getElementById ("mainView_touch2start");
    APP.mainView.clockElement = document.getElementById ("mainView_clock");
    APP.mainView.groundElement = document.getElementById ("mainView_ground");
    APP.mainView.skyElement = document.getElementById ("mainView_sky");
    APP.mainView.sunElement = document.getElementById ("mainView_sun");
    APP.mainView.moonElement = document.getElementById ("mainView_moon");
    
    
//    APP.FW.addEventListenerTo ( "touchend", APP.mainView.touchToStart, APP.mainView.startTime );
    APP.FW.addEventListenerTo ( "click", APP.mainView.touchToStart, APP.mainView.startTime );
    
    APP.mainView.time = 0;
    
    APP.mainView.element.style.opacity = "1"; // fade the view in.
       
}

APP.mainView.startTime = function ()
{
  APP.mainView.dawnStartedAt = (new Date()).getTime() / 1000;
  APP.mainView.time = 0;
  APP.mainView.timerId = setInterval (APP.mainView.updateTime,100);
  APP.mainView.clockTimerId = setInterval (APP.mainView.updateClock,500);
  APP.mainView.animationId = setInterval (APP.mainView.updateDisplay,1000);
  APP.mainView.touchToStart.style.opacity = 0;
  setTimeout ( function() { APP.mainView.touchToStart.style.display="none"; }, 255 );
}

APP.mainView.updateTime = function ()
{
  var theCurrentTime = (new Date()).getTime() / 1000;
  var theTimeDelta = theCurrentTime - APP.mainView.dawnStartedAt;
  var theTimeFactor = 1;
  
  var theNewMinecraftTime = (theTimeDelta*theTimeFactor) % 1200;
  
  APP.mainView.time = theNewMinecraftTime;
}

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

APP.mainView.updateDisplay = function ()
{
  var theSun = APP.mainView.sunElement;
  var theMoon = APP.mainView.moonElement;
  var theSky = APP.mainView.skyElement;
  var theGround = APP.mainView.groundElement;
  var theTime = APP.mainView.time;
  
  // calculate the position of the sun and moon according to the time of day
//  theSun.style.left = 50 - (Math.cos ( (theTime/(1200/360)) * Math.PI/180 ) * 25) + "%";
  if ( 0 < theTime && theTime < 800 )
  {
    theSun.style.top  = 40 - (Math.sin ( (theTime/(800/180)) * Math.PI/180 ) * 35) + "%";
    theMoon.style.top = "50%";
  }
  if ( 800 < theTime && theTime < 1200 )
  {
    theMoon.style.top  = 40 - (Math.sin ( ((1200-theTime)/(400/180)) * Math.PI/180 ) * 35) + "%";
    theSun.style.top = "50%";
  }
  

  // calculate the colors of the sky and ground according to the time of day
//  theTime = APP.mainView.time;
  if ( 100 < theTime && theTime< 700 )
  {
    // daytime
    theSky.style.backgroundColor = "rgb(159, 217, 247)";
    theGround.style.backgroundColor = "rgb(32, 128, 64)";
  }
  else
  {
    // night time
    if ( 0 < theTime && theTime < 100 )
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
    if ( 700 < theTime && theTime < 800 )
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
  }
}
