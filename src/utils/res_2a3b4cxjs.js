// Stub resolution utility (prevents 404 when referenced by app.html/swxjs.js)
(function(){
  // minimal API used by app: expose device resolution helpers if needed
  window.AppResolution = window.AppResolution || {
    getViewport: function(){ return { width: window.innerWidth, height: window.innerHeight }; }
  };
})();
