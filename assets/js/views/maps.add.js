app.views.MapsAddView = Backbone.View.extend({

  el: 'body',

  initialize: function(options) {
    var points = options.points,
        width = options.width,
        height = options.height;
    
    var lines = this.generateLines(points, width, height, options);
    
    this.drawMap(lines, width, height);
    this.initPanZoom($("#map-svg")); 
  },
  
  initPanZoom: function($selector){    
    var $panzoom = $selector.panzoom();    
    $panzoom.parent().on('mousewheel.focal', function( e ) {
      e.preventDefault();
      var delta = e.delta || e.originalEvent.wheelDelta;
      var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
      $panzoom.panzoom('zoom', zoomOut, {
        increment: 0.1,
        animate: false,
        focal: e
      });
    });
  },
  
  drawMap: function(lines, width, height){
    var svg = d3.select("#svg-wrapper")
      .append("svg")
      .attr("id", "map-svg")
      .attr("width", width)
      .attr("height", height);

    var svg_line = d3.svg.line()
      .x(function(d) { return d.x; })
      .y(function(d) { return d.y; });
    
    var labels = [];
    _.each(lines, function(line){
      var path = svg.append("path")
        .attr("d", svg_line(line.points))
        .style("stroke", line.color)
        .style("stroke-width", line.strokeWidth)
        .style("stroke-linecap", "round")
        .style("stroke-linejoin", "round")
        .style("fill", "none");
      
      var line_labels = _.filter(line.points, function(p){ return p.label !== undefined; });
      labels = _.union(labels, line_labels);      
    });
    
    // add dots and labels
    svg.selectAll("dot")
        .data(labels)
        .enter().append("circle")
        .attr("r", function(d) { return d.pointRadius; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .style("fill", function(d){ return d.pointColor; }); 
  },
  
  exportSVG: function(){    
    var svg_xml = $("#map-svg").parent().html(),
        b64 = window.btoa(svg_xml);
        
    data_url = "data:image/svg+xml;base64,\n"+b64;  
    window.open(data_url, '_blank');
    
    // $("body").append($("<img src='data:image/svg+xml;base64,\n"+b64+"' alt='file.svg'/>"));
  },
  
  generateLines: function(points, width, height, options){
    var that = this,
        // options
        paddingX = options.padding[0],
        paddingY = options.padding[1],
        colors = options.colors,
        pathTypes = options.pathTypes,
        strokeWidth = options.strokeWidth,
        pointRadius = options.pointRadius,
        pointColor = options.pointColor,
        // calculations
        activeW = width - paddingX*2,
        activeH = height - paddingY*2,
        boundaries = {minX: paddingX, minY: paddingY, maxX: width-paddingX, maxY: height-paddingY},
        pointCount = points.length,
        yUnit = Math.floor(activeH/pointCount),
        // initializers
        lines = [],
        colorIndex = 0;
    
    // ensure y-unit is not zero
    if (yUnit<=0) yUnit = 1;
    
    // loop through points
    _.each(points, function(point, i){
      var nextY = paddingY + i * yUnit, // next available yUnit
          nextX = that.getNextX(boundaries, i, pointCount, activeW), // random X
          targetPoint = false,          
          offsetX = 1;
      // loop through point's lines
      _.each(point.lines, function(lineLabel, j){
        // if line already exists
        var foundLine = _.findWhere(lines, {label: lineLabel}),
            newPoint, prevPoint;
        
        // if line already exists, make sure X is within 20% of previous X
        if (foundLine) {
          prevPoint = _.last(foundLine.points);          
          nextX = that.getNextX(boundaries, i, pointCount, activeW, prevPoint);
        }
        
        newPoint = {
          x: nextX,
          y: nextY,
          pointRadius: pointRadius,
          pointColor: pointColor
        };
            
        // for first line, just add target point
        if (targetPoint===false) {
          targetPoint = newPoint;
          newPoint.label = point.label; // only the target point of the first line gets label
          
        // for additional new lines, place first point next to the first line's target point with offset
        } else {
          // newPoint.x = targetPoint.x + offsetX*strokeWidth; // TODO: do offset correctly     
          newPoint.x = targetPoint.x;
          newPoint.offsetX = offsetX;
          offsetX++;
        }
        
        // line already exists
        if (foundLine){
          var transitionPoints = [];
          
          // add transition points
          transitionPoints = that.getPointsBetween(prevPoint.x, prevPoint.y, newPoint.x, newPoint.y, pathTypes);
          _.each(transitionPoints, function(tp){
            foundLine.points.push(tp);
          });
          
          // finally add new point
          foundLine.points.push(newPoint);
          
        // line does not exist, add a new one
        } else {          
          var newLine = {
                label: lineLabel,
                color: colors[colorIndex].hex,
                strokeWidth: strokeWidth,
                points: []            
              };
          // add point to line, add line to lines
          newLine.points.push(newPoint);
          lines.push(newLine);
          // increment color index
          colorIndex++;
          if (colorIndex>=colors.length)
            colorIndex = 0;
        }
      });      
    });
    
    return lines;
  },
  
  getLengths: function(xDiff, yDiff, directions) {
    var count = directions.length,
        xCount = 0, yCount = 0, xyCount = 0,
        xAvgLength = 0, yAvgLength = 0, minLength = 0,
        xRemainder = 0, yRemainder = 0,
        lengths = [];
    
    xDiff = Math.abs(xDiff);
    
    // count lines that change x
    xCount = _.reduce(directions, function(memo, d){
      if (d.indexOf("e")>=0 || d.indexOf("w")>=0) memo++;
      return memo;
    }, 0);
    // count lines that change y
    yCount = _.reduce(directions, function(memo, d){
      if (d.indexOf("s")>=0) memo++;
      return memo;
    }, 0);
    // count lines that change both xy
    xyCount = _.reduce(directions, function(memo, d){
      if (d.length>1) memo++;
      return memo;
    }, 0);
    
    // determine average lengths/remainders
    if (xCount>0) {
      xAvgLength = Math.floor(xDiff / xCount);
      xRemainder = xDiff % xAvgLength;
    }
    if (yCount>0) {
      yAvgLength = Math.floor(yDiff / yCount);
      yRemainder = yDiff % yAvgLength;
    }
    minLength = _.min([xAvgLength, yAvgLength]);
    
    var xRemainderAdded = false,
        yRemainderAdded = false;
    _.each(directions, function(d){
      // diagonal is always the min dimension length
      if (d.length>1) {
        lengths.push(minLength);
        
      // else if a diagonal exists
      } else if (xyCount>0) {
        
        // vertical line
        if (d.indexOf("s")>=0) {
          lengths.push(yDiff-minLength);
        // horizontal line
        } else {
          lengths.push(xDiff-minLength);
        }
        
      } else {
                
        // vertical line
        if (d.indexOf("s")>=0) {
          // add remainder once
          if (!yRemainderAdded) {            
            lengths.push(yAvgLength+yRemainder);
            yRemainderAdded = true;
          } else {
            lengths.push(yAvgLength);
          }
          
        // horizontal line
        } else {
          // add remainder once
          if (!xRemainderAdded) {            
            lengths.push(xAvgLength+xRemainder);
            xRemainderAdded = true;
          } else {
            lengths.push(xAvgLength);
          }          
        }
        
      }
      
    });
    
    return lengths;
    
  },
  
  getNextX: function(boundaries, iterator, totalPoints, width, prevPoint){
    var x = 0,
        prevPadding = 0.2,
        trendPadding = 0.3,
        percentComplete = parseFloat(iterator/totalPoints),
        // absolute min/max based on boundaries
        absMinX = boundaries.minX,
        absMaxX = boundaries.maxX,
        // min/max based on general trend from left to right
        trendMinX = percentComplete*width - Math.round(width*trendPadding),
        trendMaxX = percentComplete*width + Math.round(width*trendPadding),
        // create arrays
        mins = [absMinX, trendMinX],
        maxs = [absMaxX, trendMaxX];
    
    // make sure point is within x% of previous point
    if (prevPoint) {
      mins.push(prevPoint.x - Math.round(width*prevPadding));
      maxs.push(prevPoint.x + Math.round(width*prevPadding));
    }
    
    // determine the min/max
    minX = _.max(mins);
    maxX = _.min(maxs);
    
    // ensure no logic error
    if (minX<maxX) {
      x =  _.random(minX, maxX);
    } else {
      x =  _.random(maxX, minX);
    }   
    
    return x;
  },
  
  getPointsBetween: function(x1, y1, x2, y2, pathTypes) {
    var that = this,
        points = [],
        gridUnit = 5,
        yDiff = y2 - y1
        xDiff = x2 - x1,
        xDirection = false,
        pathType = false,
        // determine x/y units
        xUnits = Math.floor(Math.abs(xDiff/gridUnit)),
        yUnits = Math.floor(yDiff/gridUnit);
        
    // determine x direction 
    if (xDiff>0) {
      xDirection = "e";
    } else if (xDiff<0) {
      xDirection = "w";
    }
    
    // ensure no zero x/y units
    if (xDirection!==false && xUnits<=0) {
      xUnits = 1;
    }
    if (yUnits<=0) {
      yUnits = 1;
    }
    
    // filter and choose random path type
    pathTypes = _.filter(pathTypes, function(pt){
      return pt.xDirection===xDirection 
              && xUnits >= pt.minXUnit
              && yUnits >= pt.minYUnit;
    });    
    pathType = _.sample(pathTypes);

    // get points if path type exists
    if (pathType && pathType.directions) {
      // retrieve directions
      var directions = pathType.directions;     
      
      // shuffle if necessary    
      if (pathType.shuffle) {
        directions = _.shuffle(directions);
      }
      
      // retrieve points
      var x = x1, y = y1,
          lengths = that.getLengths(xDiff, yDiff, directions);
      _.each(directions, function(direction, i){
        var point = that.translateCoordinates(x, y, direction, lengths[i]);
        x = point.x;
        y = point.y;
        point.direction1 = direction;
        points.push(point);
      });
           
      // remove last point since we just want the transition points
      points.pop()
    }   
    
    return points;
  },
  
  getTextPosition: function(direction1, direction2) {
    var pos = 's',
        d1 = direction1, d2 = direction2;
    
    // first segment
    if (!d1) {
      if (_.indexOf(['e','se','s','sw','w'], d2) >= 0) pos = 'n';
    // last segment
    } else if (!d2) {
      if (_.indexOf(['n','ne','e','w','nw'], d1) >= 0) pos = 'n';
    // two segments   
    } else {
      if (d1==='n') {
        if (_.indexOf(['n','ne'], d2) >= 0) pos = 'w';
        else if (_.indexOf(['e','w'], d2) >= 0) pos = 'n';
        else if (_.indexOf(['nw'], d2) >= 0) pos = 'e';
      } else if (d1==='ne') {
        if (_.indexOf(['n','ne','nw'], d2) >= 0) pos = 'e';
        else if (_.indexOf(['e','se'], d2) >= 0) pos = 'n';
      } else if (d1==='e') {
        if (_.indexOf(['se','s'], d2) >= 0) pos = 'n';
      } else if (d1==='se') {
        if (_.indexOf(['se'], d2) >= 0) pos = 'w';
        else if (_.indexOf(['s','sw'], d2) >= 0) pos = 'e';
      } else if (d1==='s') {
        if (_.indexOf(['se','s'], d2) >= 0) pos = 'w';
        else if (_.indexOf(['sw'], d2) >= 0) pos = 'e';
      } else if (d1==='sw') {
        if (_.indexOf(['sw'], d2) >= 0) pos = 'e';
        else if (_.indexOf(['se','s'], d2) >= 0) pos = 'w';
      } else if (d1==='w') {
        if (_.indexOf(['s','sw'], d2) >= 0) pos = 'n';
      } else if (d1==='nw') {
        if (_.indexOf(['n','ne','nw'], d2) >= 0) pos = 'w';
        else if (_.indexOf(['sw','w'], d2) >= 0) pos = 'n';
      }
    }
    
    return pos;
  },
  
  translateCoordinates: function(x, y, direction, length){
    var x_direction = 0, y_direction = 0;
    
    switch(direction){
      case 'n':
        y_direction = -1;
        break;
      case 'ne':
        y_direction = -1; x_direction = 1;
        break;
      case 'e':
        x_direction = 1;
        break;
      case 'se':
        y_direction = 1; x_direction = 1;
        break;
      case 's':
        y_direction = 1;
        break;
      case 'sw':
        y_direction = 1; x_direction = -1;
        break;
      case 'w':
        x_direction = -1;
        break;
      case 'nw':
        y_direction = -1; x_direction = -1;
        break;
    }
    return {
      x: x + length * x_direction,
      y: y + length * y_direction
    };
  }

});
