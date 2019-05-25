/* Add Transit View */
app.views.TransitAddView = Backbone.View.extend({

  el: '#transit-add',

  events: {
    "submit #memory-form": "addMemoryOnSubmit",
    "click .person-add-link": "addPersonOnClick",
    "keypress .person-input": "addPersonOnEnter",
    "submit #transit-form": "addTransitOnSubmit",
    "click .add-memory-button": "resetForm"
  },

  initialize: function(options) {
    this.initSortable();

    var localTransit = helper.localStore("transit-map"),
        remoteTransit = options.transit;

    // transit map loaded from local storage
    if (localTransit) {

      // if remote transit doesn't match local, take remote version
      if (remoteTransit && options.transit.get('slug') != localTransit.slug) {
        this.transit = remoteTransit;

      // otherwise, take the local version
      } else {
        this.transit = new app.models.Transit(localTransit);
      }

      this.initTransit();

    // transit map loaded from server
    } else if (remoteTransit) {
      this.transit = remoteTransit;
      this.initTransit();

    // create a new map
    } else {
      this.transit = new app.models.Transit({user: options.user});
    }

    this.$('#people .person-input').focus();
    this.resetErrors();
  },

  addMemory: function(data){
    var station = new app.models.Station(data);

    this.transit.addStation(station);
    this.doAfterChange();

    this.addMemoryToView(station);
    app.views.util.showTab('#memories');
    this.resetForm();
    $('#add-memory-success-message').show();
  },

  addMemoryOnSubmit: function(e){
    e.preventDefault();

    var $form = $(e.currentTarget),
        id = $form.attr('data-memory-id'),
        name = $form.find('input[name="name"]').val().trim(),
        selectLinks = $form.find('.toggle-select-link.active').toArray(),
        lineNames = _.map(selectLinks, function(link){ return $(link).attr('data-name'); }),
        stationData = {name: name, lines: [], order: this.transit.get('stations').length},
        station;

    this.transit.get('lines').each(function(line){
      if (lineNames.indexOf(line.get('name')) >= 0) {
        stationData.lines.push(line.toJSON());
      }
    });

    if (!this.isValidMemory(stationData)) {
      this.showErrorMessage();
      return false;
    }

    if (id.length) {
      station = this.transit.get('stations').findWhere({id: id});
      this.updateMemory(station, stationData);

    } else {
      this.addMemory(stationData);
    }
  },

  addMemoryToView: function(station){
    var listItem = new app.views.MemoryListItem({model: station, transit: this.transit}),
        $listItem = listItem.render().$el;

    this.$("#memories-list").append($listItem.addClass('grow-in-down'));
    this.$('#memories-list').sortable("refresh");
    setTimeout(function(){$listItem.removeClass('grow-in-down')}, 2000);
  },

  addPerson: function($input) {
    var name = $input.val().trim(),
        lineData = {name: name},
        line;

    if (!this.isValidPerson(lineData)) {
      this.showErrorMessage();
      return false;
    }

    line = new app.models.Line(lineData);
    if ($input.attr('data-active')) line.set('active', true);
    this.transit.addLine(line);
    this.doAfterChange();

    this.addPersonToView(line);
    this.$('#add-person-success-message').show();
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
        $listItem = listItem.render().$el,
        selectItem = new app.views.PersonSelectItem({model: line});

    this.$("#people-list").prepend($listItem.addClass('grow-in-down'));
    this.$("#people-select-list").prepend(selectItem.render().el);
    setTimeout(function(){$listItem.removeClass('grow-in-down')}, 2000);
  },

  addTransitOnSubmit: function(e){
    e.preventDefault();
    var $form = $(e.currentTarget),
        data = {};

    data.title = $form.find('input[name="title"]').val().trim();
    data.legend = $form.find('#button-legend').hasClass('active') ? 1 : 0;
    data.labels = $form.find('#button-labels').hasClass('active') ? 1 : 0;

    this.transit.set(data);

    if (!this.isValidTransit()){
      this.showErrorMessage();
      return false;
    }

    this.saveMap();
  },

  doAfterChange: function(){
    this.transit.autoSave();

    this.renderPreview();
  },

  initSortable: function(){
    var that = this;

    this.$('#memories-list').sortable({
      stop: function(event, ui){
        that.sortMemories();
      }
    });
  },

  initTransit: function(){
    var that = this;

    // add people/lines
    this.transit.get('lines').each(function(line){
      that.addPersonToView(line);
    });

    // add memories/stations
    this.transit.get('stations').each(function(station){
      that.addMemoryToView(station);
    });

    // add transit
    $('#transit-form').find('input[name="title"]').val(this.transit.get('title'));
    if (this.transit.get('legend') <= 0) $('#button-legend').removeClass('active');
    if (this.transit.get('labels') <= 0) $('#button-labels').removeClass('active');

    // render preview
    this.renderPreview();
  },

  isValidMemory: function(data){
    if (data.name.length <= 0) {
      this.errors.push("You must enter a memory");
      return false;
    }

    if (data.lines.length <= 0) {
      this.errors.push("You must select at least one person in this memory");
      return false;
    }

    return true;
  },

  isValidPerson: function(data){
    if (data.name.length <= 0) {
      this.errors.push("You must enter a name");
      return false;
    }

    if (this.transit.get('lines').findWhere({name: data.name})) {
      this.errors.push('You have already entered the name "'+data.name+'"');
      return false;
    }

    return true;
  },

  isValidTransit: function(){
    if (this.transit.get('title').length <= 0) {
      this.errors.push("You must enter a title for your map");
      return false;
    }

    if (this.transit.get('stations').length < 2) {
      this.errors.push("You must enter at least two memories");
      return false;
    }

    return true;
  },

  renderPreview: function(){
    var params = $.extend({}, config);

    params.transit = this.transit.toJSON();
    params.transit.legend = 0;
    params.transit.labels = 1;
    params.animationDuration = 0;
    params.padding = [200, 100];
    app.views.preview.render(params);

    if (this.transit.get('stations').length > 0) {
      $('.empty-message').hide();

    } else {
      $('.empty-message').show();
    }
  },

  resetErrors: function(){
    this.errors = [];
  },

  resetForm: function(){
    var $form = $('#memory-form');

    $form.find('input[name="name"]').val('').focus();
    $form.find('.toggle-select-link').removeClass('active');
    $form.attr('data-memory-id','');
    $('#person-input-group').hide();
  },

  saveMap: function(){
    this.$('#transit-form button[type="submit"]').prop("disabled",true).text("Saving Map For Viewing...");

    this.transit.saveLocal(true);
  },

  showErrorMessage: function(){
    if (!this.errors.length) return false;

    var message = this.errors.join(". ");
    this.resetErrors();
    alert(message);
  },

  sortMemories: function(){
    var ids = $('#memories-list').sortable('toArray',{attribute: 'data-id'});

    for(var i=0; i<ids.length; i++){
      var id = ids[i],
          station = this.transit.get('stations').findWhere({id: id});
      if (station) station.set('order', i, {silent: true});
    }

    this.transit.get('stations').sort();
    this.doAfterChange();
  },

  updateMemory: function(station, data) {
    this.transit.editStation(station, data);
    this.doAfterChange();
    app.views.util.showTab('#memories');
    this.resetForm();
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
    app.views.main.doAfterChange();
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

    app.views.main.resetForm();
    $('.toggle-select-link').removeClass('active');
    $('.toggle-select-link[data-name="'+name+'"]').addClass('active');
  },

  toggleList: function(e) {
    e.preventDefault();
    this.$el.find('.list').toggleClass('active');
  },

  updateName: function(e){
    var data = {name: $(e.currentTarget).val().trim()};

    if (app.views.main.isValidPerson(data)) {
      this.transit.editLine(this.model, data);
      app.views.main.doAfterChange();

    } else {
      this.$('.person-edit').val(this.model.get('name'));
      app.views.main.resetErrors();
    }
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

    $form.attr('data-memory-id', this.model.get("id"));
    $form.find('input[name="name"]').val(this.model.get("name"));
    $form.find('.toggle-select-link').removeClass('active');
    _.each(this.model.get('lines'), function(line){
      $form.find('.toggle-select-link[data-name="'+line.name+'"]').addClass('active');
    });

    app.views.util.showTab('#add-memory');

    $('html, body').animate({
      scrollTop: $form.offset().top
    }, 1000);
  },

  remove: function(e){
    e.preventDefault();
    this.transit.deleteStation(this.model);
    app.views.main.doAfterChange();
  },

  render: function() {
    if (this.model.get('name')) {
      this.$el.attr('data-id', this.model.get('id'));
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

app.views.TransitToolbarView = Backbone.View.extend({

  el: '#transit-toolbar',

  initialize: function(options) {

    if (options.user){
      this.getUserMaps(options.user);
    }
  },

  addTransitLinks: function(maps){
    _.each(maps, function(map){
      $('#transit-list').append($('<a href="/map/edit/'+map.token+'">'+map.title+'</a>'));
    });

    if (maps.length > 0 ) {
      $('#transit-list-link').removeClass('hide');
    }
  },

  getUserMaps: function(user){
    var that = this;

    $.getJSON( "/api/map/user/"+user, function(data) {
      that.addTransitLinks(data);
    });
  }

});
