app.views.Util = Backbone.View.extend({

  el: 'body',
  
  events: {
    "click a[data-focus]": "focusElement",
    "click .tab-link": "showTabOnClick",
    "click .toggle-active-link": "toggleActive",
    "click .toggle-element": "toggleElement" 
  },

  initialize: function(options) {},
  
  focusElement: function(e){
    var target = $(e.currentTarget).attr('data-focus');
    
    $(target).focus();    
  },
  
  showTab: function(href) {
    var $tab = $(href),
        $tabLink = $('.tab-link[href="'+href+'"]');
        
    $('.tab, .tab-link').removeClass('active');
    $tab.addClass('active');
    $tabLink.addClass('active')
  },
  
  showTabOnClick: function(e){
    e.preventDefault();
    
    var $link = $(e.currentTarget),
        href = $link.attr('href');
        
    this.showTab(href);
  },
  
  toggleActive: function(e){
    e.preventDefault();
    
    $(e.currentTarget).toggleClass('active');
  },
  
  toggleElement: function(e){
    e.preventDefault();
    
    var href = $(e.currentTarget).attr('href'),
        $el = $(href);
        
    $el.slideToggle();
  }

});