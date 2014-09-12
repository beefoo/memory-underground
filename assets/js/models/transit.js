app.models.Line = Backbone.Model.extend({
  
  defaults: function() {
    return {
      name: '',
      active: false
    };
  },
  
  initialize: function(){
    this.set('stations', []);
  },
  
  toJSON: function(){
    var stations = this.get('stations'),
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
      name: '',
      order: 0
    };
  },
  
  initialize: function(){
    this.set('id', _.uniqueId('station_'));
  },
  
  toJSON: function(){
    var lines = this.get('lines'),
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
    this.get('lines').add(line);
    return line;
  },
  
  deleteLine: function(line) {
    this.get('lines').remove(line);
    line.clear();
  },
  
  addStation: function(station) {    
    this.get('stations').add(station);
    return station;
  },
  
  deleteStation: function(station) {
    this.get('stations').remove(station);
    station.clear();
  }

});
