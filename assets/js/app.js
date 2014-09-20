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
    'map/edit/:token': 'transitEdit',
    'map/:slug/:title': 'transitShow',
    'map/:slug': 'transitShow'
  },
  
  initialize: function(){
    
  },
  
  home: function(){
    app.views.main = new app.views.HomeView({});
  },
  
  transitAdd: function(params){
    params = helper.parseQueryString(params);
    params = $.extend({}, config, params);
    params.user = this._getUser();
    app.views.main = new app.views.TransitAddView(params);
  },
  
  transitEdit: function(token){
    var that = this;       
    
    $.getJSON( "/api/map/edit/"+token, function(data) {
      var transit = new app.models.Transit(data);
      app.views.main = new app.views.TransitAddView({transit: transit});
    });
  }, 
  
  transitShow: function(slug){
    var that = this;
    
    $.getJSON( "/api/map/"+slug, function(data) {
      var params = $.extend({}, config);
      params.transit = data;
      params.user = that._getUser();
      app.views.main = new app.views.TransitShowView(params);
    }); 
  },
  
  _getUser: function(){
    var user = $.cookie('user');
    
    if (!user){
      user = helper.token();
      $.cookie('user', user, { expires: 1000 });
    }
    
    return user;
  }

});

// Init backbone app
$(document).ready(function(){
  app.init();
});