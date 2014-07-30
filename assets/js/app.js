window.app = {  
  models: {},
  collections: {},
  views: {},
  routers: {},
  init: function() {    
    app.routers.main = new app.routers.MainRouter();
    // Enable pushState for compatible browsers
    var enablePushState = true;
    // Disable for older browsers
    var pushState = !!(enablePushState && window.history && window.history.pushState);
    // Start **Backbone History**
    Backbone.history = Backbone.history || new Backbone.History({});
    Backbone.history.start({
      pushState:pushState
    });
  }
};

// Define routes
app.routers.MainRouter = Backbone.Router.extend({

  routes: {
    '': 'home',
    'build': 'mapsAdd',
    'build?*queryString': 'mapsAdd',
    'build/:id': 'mapsEdit',
    'maps/:id': 'mapsShow'
  },
  
  home: function(){
    app.views.main = new app.views.HomeView({});
  },
  
  mapsAdd: function(params){
    params = helper.parseQueryString(params);
    params = $.extend({}, config, params);
    $.getJSON( "/data/brian.json", function(data) {
      params.stations = data.stations;
      app.views.main = new app.views.MapsAddView(params);
    });   
  },
  
  mapsEdit: function(id){
    var map = null;
    app.views.main = new app.views.MapsAddView({model: map});
  }, 
  
  mapsShow: function(id){
    var map = null;
    app.views.main = new app.views.MapsShowView({model: map});
  }

});

// Init backbone app
$(document).ready(function(){
  app.init();
});