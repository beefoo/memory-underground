app.collections.LineList = Backbone.Collection.extend({

  model: app.models.Line

});

app.collections.StationList = Backbone.Collection.extend({

  model: app.models.Station,
  
  comparator: 'order'

});

app.collections.TransitList = Backbone.Collection.extend({

  model: app.models.Transit

});
