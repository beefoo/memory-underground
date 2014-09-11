app.models.Line = Backbone.Model.extend({
  
  defaults: function() {
    return {
      name: '',
      active: false
    };
  },
  
  initialize: function(){
    this.set('stations', new app.collections.StationList);
  },
  
  toJSON: function(){
    var stations = this.get('stations').toJSON(),
        stationString = _.reduce(stations, function(memo, station){return memo + ", " + station.name}, "");
        
    stationString = stationString.slice(2);
    return {
      name: this.get('name'),
      active: this.get('active'),
      stations: stations,
      stationString: stationString
    }
  }
  
});


app.models.Station = Backbone.Model.extend({
  
  defaults: function() {
    return {
      name: ''
    };
  },
  
  initialize: function(){
    this.set('id', _.uniqueId('station_'));
  },
  
  toJSON: function(){
    var lines = this.get('lines').toJSON(),
        lineString = _.reduce(lines, function(memo, line){return memo + ", " + line.name}, "");
    lineString = lineString.slice(2);
    return {
      id: this.get('id'),
      name: this.get('name'),
      lines: lines,
      lineString: lineString   
    }
  }
  
});


app.models.Transit = Backbone.Model.extend({

  defaults: function() {
    return {
      title: '',
      user: ''
    };
  },
  
  initialize: function(){
    this.set('lines', new app.collections.LineList);
    this.set('stations', new app.collections.StationList);
  },
  
  addLine: function(line) {    
    if (line.get('name').length <= 0 
        || this.get('lines').findWhere({name: line.get('name')}) ) return false;
    
    this.get('lines').add(line);
    return line;
  },
  
  editLine: function(line, properties) {
    this.get('lines').each(function(l){
      if (l.get('name') == line.get('name')) {
        l.set(properties);
      }
    });
  },
  
  deleteLine: function(line) {
    this.get('lines').remove(line);
    line.clear();
  },
  
  addStation: function(station) {
    if (station.get('name').length <= 0 || station.get('lines').length <= 0) return false;
    
    this.get('stations').add(station);
    return station;
  },
  
  editStation: function(station, properties) {
    this.get('stations').each(function(s){
      if (s.get('name') == station.get('name')) {
        s.set(properties);
      }
    });
  },
  
  deleteStation: function(station) {
    this.get('stations').remove(station);
    station.clear();
  }

});
