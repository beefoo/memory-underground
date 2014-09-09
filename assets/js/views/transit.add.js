app.views.TransitAddView = Backbone.View.extend({

  el: '#transit-add',
  
  events: {
    "click .tab-link"   : "showTab"
  },

  initialize: function(options) {
    
  },
  
  showTab: function(e){
    e.preventDefault();
    
    var $link = $(e.currentTarget),
        href = $link.attr('href'),
        $tab = $(href),
        $tabLink = $('.tab-link[href="'+href+'"]');
        
    $('.tab, .tab-link').removeClass('active');
    $tab.addClass('active');
    $tabLink.addClass('active');
  }

});
