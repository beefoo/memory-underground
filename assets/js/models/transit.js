app.models.Line = Backbone.Model.extend({

  defaults: function() {
    return {
      name: '',
      active: false
    };
  },

  initialize: function(){
    if (!this.get('stations')) this.set('stations', []);
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
    if (!this.get('id')) this.set('id', _.uniqueId('station_'));
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
  },

  toSavableJSON: function(){
    return {
      label: this.get('name'),
      lines: this.getLineNames()
    };
  }

});


app.models.Transit = Backbone.Model.extend({

  defaults: function() {
    return {
      title: 'Untitled Memory Map',
      legend: 1,
      labels: 1
    };
  },

  initialize: function(){
    if (!this.get('slug')) this.set('slug', helper.randomString(8));
    if (!this.get('token')) this.set('token', helper.token());
    if (this.get('legend')) this.set('legend', parseInt(this.get('legend')));
    if (this.get('labels')) this.set('labels', parseInt(this.get('labels')));

    var stationData = this.get('stations'),
        lineData = this.get('lines');

    this.set('lines', new app.collections.LineList);
    this.set('stations', new app.collections.StationList);

    if (stationData){
      this.addStationsFromData(stationData);
      this.addLinesFromStations();
    }

    if (lineData){
      this.addLines(lineData);
    }
  },

  addLine: function(line) {
    this.get('lines').add(line);
    return line;
  },

  addLines: function(lineNames){
    var that = this;

    _.each(lineNames, function(name){
      var line = that.get('lines').findWhere({name: name});
      if (!line){
        that.get('lines').add(new app.models.Line({name: name, stations: []}));
      }
    });
  },

  addLinesFromStations: function(){
    var that = this;

    this.get('stations').each(function(station){
      var stationData = {
        id: station.get('id'),
        name: station.get('name')
      };
      _.each(station.get('lines'), function(lineData){
        var line = that.get('lines').findWhere({name: lineData.name});
        if (line){
          line.get('stations').push(stationData);
        } else {
          that.get('lines').add(new app.models.Line({name: lineData.name, stations: [stationData]}));
        }
      });
    });
  },

  autoSave: function(){
    this.saveLocal();
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

    // update line's stations
    var stationIds = line.getStationIds(),
        stationMatches = this.get('stations').filter(function(station){return (stationIds.indexOf(station.get('id')) >= 0);});

    _.each(stationMatches, function(station){
      var stationLines = _.reject(station.get('lines'), function(stationLine){return stationLine.name == line.get('name')});
      station.set('lines', stationLines);
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

  addStationsFromData: function(stationData){
    var that = this;

    _.each(stationData, function(data, i){
      var stationData = {
        name: data.label,
        lines: _.map(data.lines, function(line){ return {name: line};}),
        order: i
      };
      that.get('stations').add(new app.models.Station(stationData));
    });
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
  },

  resetLocal: function(){
    helper.localStoreRemove("transit-map");
  },

  save: function(redirect){
    var that = this,
        data = this.toJSON(true);

    $.post('/api/map/save/'+this.get('token'), data, function(resp){
      that.resetLocal();
      if (redirect) window.location = '/map/'+that.get('slug')+'/'+helper.parameterize(that.get('title'));
    }, 'json');
  },

  saveLocal: function(redirect){
    var data = this.toJSON();
    helper.localStoreSet("transit-map", data);
    if (redirect) {
      setTimeout(function(){
        window.location = '/map/view.html';
      }, 50);
    }
  },

  toJSON: function(stringify){
    var stations = [],
        lines = [];

    this.get('stations').each(function(station){
      if (station.get('lines').length > 0)
        stations.push(station.toSavableJSON());
    });

    lines = this.get('lines').pluck('name');

    if (stringify){
      stations = JSON.stringify(stations);
      lines = JSON.stringify(stations);
    }

    return {
      title: this.get('title'),
      slug: this.get('slug'),
      user: this.get('user'),
      token: this.get('token'),
      legend: this.get('legend'),
      labels: this.get('labels'),
      stations: stations,
      lines: lines
    };
  }

});
