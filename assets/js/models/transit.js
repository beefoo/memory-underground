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
  
  getStationIds: function(){
    return _.pluck(this.get('stations'), 'id');
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
  
  getLineNames: function(){
    return _.pluck(this.get('lines'), 'name');
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
  
  editLine: function(line, data){
    var name = line.get('name');
    
    line.set(data);
    
    // update line's stations
    var stationIds = line.getStationIds(),
        stationMatches = this.get('stations').filter(function(station){return (stationIds.indexOf(station.get('id')) >= 0);});
        
    _.each(stationMatches, function(station){
      _.each(station.get('lines'), function(stationLine){
        if (stationLine.name == name) {
          _.each(data, function(val, key) {
            stationLine[key] = val;
          });
        }
      });
      station.trigger('change');
    });

  },
  
  deleteLine: function(line) {
    this.get('lines').remove(line);
    // let all of the line's stations know
    this.get('stations').each(function(station){
      var lineNames = station.getLineNames();
    });
    line.clear();
  },
  
  addStation: function(station) {    
    this.get('stations').add(station);
    
    // add new station to lines
    var lineNames = station.getLineNames();
    this.get('lines').each(function(line){      
      if (lineNames.indexOf(line.get('name')) >= 0) {        
        line.get('stations').push(station.toJSON());
        line.trigger('change');
      }
    });
    
    return station;
  },
  
  editStation: function(station, data) {
    station.set(data);
    
    // update station's lines
    var lineNames = station.getLineNames(),
        lineMatches = this.get('lines').filter(function(line){return (lineNames.indexOf(line.get('name')) >= 0);});
    
    _.each(lineMatches, function(line){
      var lineStations = _.where(line.get('stations'), {id: station.get('id')});

      if (lineStations.length > 0) {
        _.each(lineStations, function(lineStation){
          _.each(data, function(val, key) {
            lineStation[key] = val;
          });
        });      
        
      } else {          
        line.get('stations').push(station.toJSON());
      }
      
      line.trigger('change');
    });
  },
  
  deleteStation: function(station) {
    this.get('stations').remove(station);
    
    // update station's lines
    var lineNames = station.getLineNames(),
        lineMatches = this.get('lines').filter(function(line){return (lineNames.indexOf(line.get('name')) >= 0);});
    
    _.each(lineMatches, function(line){
      var lineStations = _.reject(line.get('stations'), function(lineStation){return lineStation.id == station.get('id')});
      line.set('stations', lineStations);
    });
    
    station.clear();
  }

});
