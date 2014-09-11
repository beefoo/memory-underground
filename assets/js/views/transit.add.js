/* Add Transit View */
app.views.TransitAddView = Backbone.View.extend({

  el: '#transit-add',
  
  events: {
    "click .person-add-link": "addPersonOnClick",    
    "keypress .person-input": "addPersonOnEnter",
    "click .tab-link": "showTabOnClick",
    "submit #memory-form": "addMemoryOnSubmit",
    "click .toggle-element": "toggleElement"
  },

  initialize: function(options) {
    
    if (options.transit) {
      this.transit = options.transit;
      
    } else {
      this.transit = new app.models.Transit;
    }
    
    this.$('#people .person-input').focus();
  },
  
  addMemory: function($form){
    var name = $form.find('input[name="name"]').val().trim(),
        selectLinks = $form.find('.toggle-select-link.active').toArray(),
        lineNames = _.map(selectLinks, function(link){ return $(link).attr('data-name'); }),
        lines = new app.collections.LineList,
        station;
        
    this.transit.get('lines').each(function(line){
      if (lineNames.indexOf(line.get('name')) >= 0) {
        lines.push(line);
      }
    });
    
    station = new app.models.Station({name: name, lines: lines});  
    station = this.transit.addStation(station);
        
    if (station) this.addMemoryToView(station);    
    
    this.showTab('#memories');
    $form.find('input[name="name"]').val('').focus();
    $form.find('.toggle-select-link').removeClass('active');    
    $('#person-input-group').hide(); 
    $('#add-memory-success-message').show();
  },
  
  addMemoryOnSubmit: function(e){
    e.preventDefault();        
    this.addMemory($(e.currentTarget));
  },
  
  addMemoryToView: function(station){
    var listItem = new app.views.MemoryListItem({model: station, transit: this.transit});
        
    this.$("#memories-list").prepend(listItem.render().el);   
  },
  
  addPerson: function($input) {
    var name = $input.val().trim(),
        line = new app.models.Line({name: name});
    
    if ($input.attr('data-active')) line.set('active', true);
    
    line = this.transit.addLine(line);
        
    if (line) this.addPersonToView(line);
    
    $input.val('').focus();
  },
  
  addPersonOnClick: function(e){
    e.preventDefault();
    var $input = $(e.currentTarget).closest('.input-group').find('input.person-input').first();
    this.addPerson($input);
  },
  
  addPersonOnEnter: function(e){
    if (e.keyCode == 13) {
      e.preventDefault();
      this.addPerson($(e.currentTarget));
    }
  },
  
  addPersonToView: function(line) {
    var listItem = new app.views.PersonListItem({model: line, transit: this.transit}),
        selectItem = new app.views.PersonSelectItem({model: line});
        
    this.$("#people-list").prepend(listItem.render().el);
    this.$("#people-select-list").prepend(selectItem.render().el);
    
    this.$('#add-person-success-message').show();
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
  
  toggleElement: function(e){
    e.preventDefault();
    
    var href = $(e.currentTarget).attr('href'),
        $el = $(href);
        
    $el.slideToggle();
  }

});

/* People/Train List View */
app.views.PersonListItem = Backbone.View.extend({

  tagName:  "li",

  template: _.template($('#person-list-item').html()),

  events: {
    "click .toggle-list-link": "toggleList",
    "click .remove-link" : "remove",
    "click .tab-link": "selectPerson",
    "blur .person-edit": "updateName",
    "keypress .person-edit": "updateNameOnEnter"
  },

  initialize: function(options) {
    this.transit = options.transit;
    this.listenTo(this.model, 'change', this.render);
  },
  
  remove: function(e){
    e.preventDefault();
    this.transit.deleteLine(this.model);
  },
  
  render: function() {
    if (this.model.get('name')) {
      this.$el.html(this.template(this.model.toJSON()));
      
    } else {
      this.$el.animate({
        height: 0
      }, 500, function() {
        $(this).remove();
      });
    }  
    return this;
  },
  
  selectPerson: function(e){
    var $link = $(e.currentTarget),
        name = $link.attr('data-name');
    
    $('.toggle-select-link').removeClass('active');   
    $('.toggle-select-link[data-name="'+name+'"]').addClass('active');
  },
  
  toggleList: function(e) {
    e.preventDefault();
    this.$el.find('.list').toggleClass('active');
  },
  
  updateName: function(e){
    var name = $(e.currentTarget).val().trim();    
    this.model.set('name', name);    
  },
  
  updateNameOnEnter: function(e){
    if (e.keyCode == 13) {
      this.updateName(e);
    }
  }

});

/* People/Train Select List View */
app.views.PersonSelectItem = Backbone.View.extend({

  tagName:  "li",

  template: _.template($('#person-select-item').html()),

  events: {
    "click .toggle-select-link": "toggleSelect"
  },

  initialize: function(options) {
    this.listenTo(this.model, 'change', this.render);
  },
  
  render: function() {
    if (this.model.get('name')) {
      this.$el.html(this.template(this.model.toJSON()));
      
    } else {
      this.$el.remove();
    }  
    return this;
  },
  
  toggleSelect: function(e) {
    e.preventDefault();    
    $(e.currentTarget).toggleClass('active');
  }

});

/* Memory/Station List View */
app.views.MemoryListItem = Backbone.View.extend({

  tagName:  "li",

  template: _.template($('#memory-list-item').html()),

  events: {
    "click .toggle-list-link": "toggleList",
    "click .remove-link" : "remove",
    "click .edit-link": "edit"
  },

  initialize: function(options) {
    this.transit = options.transit;
    this.listenTo(this.model, 'change', this.render);
  },
  
  edit: function(e){
    e.preventDefault();
    
    var $form = $('#memory-form');
      
    $form.find('input[name="name"]').val(this.model.get("name"));
    $form.find('.toggle-select-link').removeClass('active');
    this.model.get('lines').each(function(line){
      $form.find('.toggle-select-link[data-name="'+line.get('name')+'"]').addClass('active');
    });
    
    app.views.main.showTab('#add-memory');
    
    $('html, body').animate({
      scrollTop: $form.offset().top
    }, 1000);
  },
  
  remove: function(e){
    e.preventDefault();
    this.transit.deleteStation(this.model);
  },
  
  render: function() {
    if (this.model.get('name')) {      
      this.$el.html(this.template(this.model.toJSON()));
      
    } else {
      this.$el.animate({
        height: 0
      }, 500, function() {
        $(this).remove();
      });
    }  
    return this;
  },
  
  toggleList: function(e) {
    e.preventDefault();
    this.$el.find('.list').toggleClass('active');
  }

});

