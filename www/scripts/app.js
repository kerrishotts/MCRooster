/*
 * MCRooster's APPLICATION script
 *
 * Author:  Kerri Shotts
 * License: MIT
 *
 */
 
var APP = APP || {};

//
// We only have one property; we'll use this
// to track whether or not the deviceReady
// event has fired or not; if it does, we
// can clear the timer below. If not, the
// timer will eventually kick off our app.
APP.startTimer = -1;

/**
 *
 * Starts our app by loading in our mainView's HTML
 * and JS code. 
*
 */
APP.start = function ()
{
  // we need to load in our only view.
  APP.FW.load ( "./views/mainView.html",
                function ( data )
                {
                  document.getElementById("rootView").innerHTML = data;

					// also, load in our view's script. Note that we have to create a script
					// element and add the text to it AND append it to the DOM to get it
					// to execute.
					// Also give 100ms for both views to finalize and the DOM to stabilize
					// before calling init();
					APP.FW.load ( "./views/mainView.js",
								function ( data )
								{
									var newScript = document.createElement ("script");
									newScript.type = "text/javascript";
									newScript.charset = "utf-8";
									newScript.text = data;
									document.body.appendChild (newScript);
									setTimeout ( APP.mainView.init,100 );
								},
								function ( errorCode )
								{
									console.log ( "Failed to load our view's script with status " + errorCode );
								}
								);

                },
                function ( errorCode )
                {
                  console.log ( "Failed to load our view with status " + errorCode );
                }
              );
              
  // assuming no failures, the HTML and associated script should be loaded
  // and the animation to display it should be occurring.
}

//
// Boiler-plate to start our app
document.addEventListener("deviceready", onDeviceReady, false);

/**
 *
 * If this is called via the above event, it means we have PG installed;
 * so we can kill the timer and start the app.
 *
 */
function onDeviceReady()
{
  if (APP.startTimer>=0)
  {
    clearTimeout (APP.startTimer);
  }
  APP.FW.init();
  APP.start();
}

/**
 *
 * On the other hand, if PG is not installed, kick us off after 2s
 * anyway. If PG intervenes prior, no harm no foul.
 *
 */
APP.startTimer = setTimeout (onDeviceReady,2000);
