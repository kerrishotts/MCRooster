/*
 * Framework / Utilities for APPooster
 */
 
var APP = APP || {};

APP.FW = APP.FW || {};

// these are determined in init() below
APP.FW.platform = "unknown";
APP.FW.formfactor = "unknown";
APP.FW.orientation = "landscape";

//
// Handle the fact that WP7.5 doesn't support touch
// events, but mouse events instead.

APP.FW.addEventListenerTo = function( theEvent, theElement, onEvent )
{
  var theNewEvent = theEvent.toLowerCase();
  if (APP.FW.platform == "wince")
  {
    // WP7
    switch (theNewEvent)
    {
      case "touchstart" : theNewEvent = "mousedown"; break;
      case "touchmove"  : theNewEvent = "mousemove"; break;
      case "touchend"   : theNewEvent = "mouseup";   break;
      default: break;
    }
  }
  theElement.addEventListener ( theNewEvent, onEvent, false );
}

//
// Handle orientation changes
//

APP.FW.updateOrientation = function ()
{
  var theOrientation = "portrait";
  switch ( window.orientation )
  {
    case   0: break;  // portrait;
    case  90: theOrientation = "landscape"; break;
    case 180: break;  // upside-down portrait
    case -90: theOrientation = "landscape"; break; // landscape, upside-down
    default:  break;
  }
  
  APP.FW.orientation = theOrientation;
  document.body.setAttribute ("class", APP.FW.platform + " " +
                                       APP.FW.formfactor + " " +
                                       APP.FW.orientation );
}

APP.FW.load = function ( whatToLoad, onSuccess, onFailure )
{
  var r = new XMLHttpRequest();
  r.onreadystatechange = function ()
  {
    if (r.readyState == 4) // loaded
    {
      if (r.status == 200 || r.status == 0) // success
      {
        if (onSuccess)
        {
          onSuccess( r.responseText );
        }
      }
      else
      {
        if (onFailure)
        {
          onFailure( r.status );
        }
      }
    }
  }
  
  var theURL = whatToLoad;
  if (APP.FW.platform == "wince" && theURL.substr(0,4)!="http")
  {
    theURL = "/app/www/" + whatToLoad;
  }
  r.open ( 'GET', theURL, true );
  r.send ( null );
}

APP.FW.init = function ()
{
  if (typeof device != 'undefined')
  {
    //
    // Take device.platform and assign it to our global
    // APP.FW.platform. Handle for ipad/iphone glitch.
    
    APP.FW.platform = device.platform().toLowerCase();
    if (APP.FW.platform.indexOf("ipad") > -1 ||
        APP.FW.platform.indexOf("iphone") > -1)
    {
      APP.FW.platform = "ios";
    }
    
    //
    // Determine our form-factor
    //
    
    APP.FW.formfactor = "phone";
    if (device.platform.indexOf("iPad")>-1 ||
        Math.max(window.screen.width,
                 window.screen.height) >= 1024)
    {
      APP.FW.formfactor = "tablet";  
    }
  }

  // deal with any orientation changes
  document.addEventListener ("orientationchange", APP.FW.updateOrientation, false);
  // go ahead and update the orientation for the first time
  // this will also apply the device and the formfactor to the body class
  APP.FW.updateOrientation();
  
}