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
    'map/add': 'transitAdd',
    'map/add?*queryString': 'transitAdd',
    'map/edit/:id': 'transitEdit',
    'map/:id': 'transitShow'
  },
  
  home: function(){
    app.views.main = new app.views.HomeView({});
  },
  
  transitAdd: function(params){
    params = helper.parseQueryString(params);
    params = $.extend({}, config, params);
    app.views.main = new app.views.TransitAddView(params);
  },
  
  transitEdit: function(id){
    $.getJSON( "/data/"+id+".json", function(data) {
      params = $.extend({}, config, data);
      app.views.main = new app.views.TransitAddView(params);
    });
  }, 
  
  transitShow: function(id){
    $.getJSON( "/data/"+id+".json", function(data) {
      params = $.extend({}, config, data);
      app.views.main = new app.views.TransitShowView(params);
    }); 
  }

});

// Init backbone app
$(document).ready(function(){
  app.init();
});