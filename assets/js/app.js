(function() {
  var App;

  App = (function() {
    function App(options) {
      var defaults = {
        debug: false
      };
      this.options = $.extend(defaults, options);
      this.init();      
    }   
    
    App.prototype.init = function(){      
    };

    return App;

  })();

  $(function() {
    return new App(config);
  });

}).call(this);
