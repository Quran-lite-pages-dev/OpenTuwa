// Stub content-protection utilities to avoid 404s.
// Real content protection logic can be implemented as needed.
window.ContentProtection = window.ContentProtection || {
  isProtectedPath: function(p){ return false; }
};
