/**
 * Cross-Browser Fullscreen
 * Merely implements Fullscreen API as of 2017-06-15
 * <https://fullscreen.spec.whatwg.org/>
 **/
(function () {    
  var findProp = function (n, o, ig) {
    var p = [ '', 'moz', 'ms', 'webkit' ];
    
    if (!(n instanceof Array))
      n = [ n ];
    
    if (!(ig instanceof Array))
      ig = [ ];
    
    for (var i = 0; i < n.length; i++)
      for (var j = 0; j < p.length; j++) {
        var a = p [j] + (p [j].length > 0 ? n [i].substring (0, 1).toUpperCase () + n [i].substring (1) : n [i]);
        
        if (ig.indexOf (a) >= 0)
          continue;
        
        if (typeof o [a] != 'undefined')
          return o [a];
      }
  }
  
  if ((typeof document.onfullscreenchange == 'undefined') ||
      (typeof document.onfullscreenerror == 'undefined')) {
    var processFullscreenChange = function (e) {
      // Just forward the event
      this.dispatchEvent (new Event ('fullscreenchange', { }));
    };
    
    var processFullscreenError = function (e) {
      // Just forward the event
      this.dispatchEvent (new Event ('fullscreenerror', { }));
    };
    
    document.addEventListener ('mozfullscreenchange', processFullscreenChange);  
    document.addEventListener ('msfullscreenchange', processFullscreenChange);
    document.addEventListener ('webkitfullscreenchange', processFullscreenChange);
    
    document.addEventListener ('mozfullscreenerror', processFullscreenError);
    document.addEventListener ('msfullscreenerror', processFullscreenError); 
    document.addEventListener ('webkitfullscreenerror', processFullscreenError);
    
    // Patch the document
    document.onfullscreenchange = null;
    document.onfullscreenerror = null;
    
    Object.defineProperty (document, 'fullscreenElement', { get : function () { return findProp ([ 'fullscreenElement', 'fullScreenElement' ], document, [ 'fullscreenElement' ]); } });
    Object.defineProperty (document, 'fullscreenEnabled', { get : function () { return findProp ('fullscreenEnabled', document, [ 'fullscreenEnabled' ]); } });
    
    // Observe new DOM-Nodes
    var rfunc;
    
    if (MutationObserver) {
      var observer = new MutationObserver (function (records) {
        for (var i = 0; i < records.length; i++) {
          for (var j = 0; j < records [i].addedNodes.length; j++) {
            var e = records [i].addedNodes [j];
            // Append requestFullscreen() to element
            e.requestFullscreen = function () {
              if (!rfunc)
                rfunc = findProp ([ 'requestFullscreen', 'requestFullScreen' ], this, [ 'requestFullscreen' ]);
              
              if (!rfunc)
                return;
              
              return rfunc.apply (this, [ ]);
            };
            
            // Setup properties
            e.onfullscreenchange = null;
            e.onfullscreenerror = null;
            
            // Setup event-propagation
            e.addEventListener ('mozfullscreenchange', processFullscreenChange);
            e.addEventListener ('msfullscreenchange', processFullscreenChange); 
            e.addEventListener ('webkitfullscreenchange', processFullscreenChange);
            
            e.addEventListener ('mozfullscreenerror', processFullscreenError);
            e.addEventListener ('msfullscreenerror', processFullscreenError); 
            e.addEventListener ('webkitfullscreenerror', processFullscreenError);
          }
        }
      });
      
      observer.observe (document, { childList : true, subtree : true });
    }
  }
  
  // Patch exitFullscreen()-Call on document
  if (!document.exitFullscreen)
    document.exitFullscreen = findProp ([ 'cancelFullscreen', 'cancelFullScreen', 'exitFullscreen' ], document);
})();
