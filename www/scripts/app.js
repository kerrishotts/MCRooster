/*
 * MCRooster's APPLICATION script
 */
 
var APP = APP || {};

APP.start = function ()
{
  // we need to load in our only view.
  APP.FW.load ( "./views/mainView.html",
                function ( data )
                {
                  document.getElementById("rootView").innerHTML = data;
                },
                function ( errorCode )
                {
                  console.log ( "Failed to load our view with status " + errorCode );
                }
              );
  // also, load in our view's script.
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
  // assuming no failures, the HTML and associated script should be loaded
  // and the animation to display it should be occurring.
}

//
// Boiler-plate to start our app
document.addEventListener ("deviceready", onDeviceReady, false);
function onDeviceReady()
{
  APP.FW.init();
  APP.start();
}

setTimeout (onDeviceReady,1000);